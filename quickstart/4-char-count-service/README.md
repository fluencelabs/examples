# 4. Char Count Service (Grants Round 11 Hackathon - Fluence)

A new service was created based in *2-hosted-service* in order to display a message's character count at the end of the message showed in 
*browser-to-service* example. e.g., (char count: 123 chars).

### Creating the WebAssembly module for char-count service

Based on `2-hosted-services` example the following service was created:

```rust
// quickstart/4-char-count-service/src/main.rs
use marine_rs_sdk::marine;
use marine_rs_sdk::module_manifest;

module_manifest!();

pub fn main() {}

#[marine]
pub struct CharCount {
    pub msg: String,
    pub count: String,
}

#[marine]
pub fn char_count(msg: String) -> CharCount {
    CharCount {
        msg: format!("{}", msg),
        count: format!("{} chars", msg.len()),
    }
}
```
where you can see that the `char_count` function return a structure `CharCount` with the message and the char count.

Run `./scripts/build.sh` to compile the code to the Wasm target from the VSCode terminal.


### Tests

A couple of test were created in our `main.rs` file:

```rust
// quickstart/4-char-count-service/src/main.rs
use marine_rs_sdk::marine;
use marine_rs_sdk::module_manifest;

//<snip>

#[cfg(test)]
mod tests {
    use marine_rs_sdk_test::marine_test;

    #[marine_test(config_path = "../configs/Config.toml", modules_dir = "../artifacts")]
    fn char_count_0(char_count: marine_test_env::char_count::ModuleInterface) {
        let actual = char_count.char_count("".to_string());
        assert_eq!(actual.msg, "");
        assert_eq!(actual.count, "0 chars");
    }

    #[marine_test(config_path = "../configs/Config.toml", modules_dir = "../artifacts")]
    fn char_count_2(char_count: marine_test_env::char_count::ModuleInterface) {
        let actual = char_count.char_count("at".to_string());
        assert_eq!(actual.msg, "at");
        assert_eq!(actual.count, "2 chars");
    }

    #[marine_test(config_path = "../configs/Config.toml", modules_dir = "../artifacts")]
    fn char_count_space(char_count: marine_test_env::char_count::ModuleInterface) {
        let actual = char_count.char_count("at aqua".to_string());
        assert_eq!(actual.count, "7 chars");
    }
}

```
For tests running use the`cargo +nightly test --release` command. 

### Run  [Marine REPL] to locally validate

In your VSCode terminal the `4-char-count-service` directory run:

```text
mrepl configs/Config.toml
```

which puts us in the REPL:

```bash
mrepl configs/Config.toml
Welcome to the Marine REPL (version 0.9.1)
Minimal supported versions
  sdk: 0.6.0
  interface-types: 0.20.0

app service was created with service id = eae244b2-b94a-460b-8e34-bc207f56ad3f
elapsed time 102.722152ms

1> i
Loaded modules interface:
data CharCount:
  msg: string
  count: string

char_count:
  fn char_count(msg: string) -> CharCount

2> call char_count char_count ["At Fluence"]
result: Object({"count": String("10 chars"), "msg": String("At Fluence")})
 elapsed time: 185.709µs

3> 
```

### Exporting WebAssembly Interfaces To Aqua


```text
marine aqua artifacts/char_count.wasm
```

Which gives us the Aqua-ready interfaces:

```haskell
module CharCount declares *

data CharCount:
  msg: string
  count: string

service CharCount:
  char_count(msg: string) -> CharCount
```

### Deploying the Wasm Module To The Network

To get a peer from one of the Fluence testnets use `fldist`. 

```text
fldist env
```
Let's use the peer`12D3KooWFtf3rfCDAfWwt6oLZYZbDfn9Vn7bv7g6QjjQxUUEFVBt`

```bash
fldist --node-id 12D3KooWFtf3rfCDAfWwt6oLZYZbDfn9Vn7bv7g6QjjQxUUEFVBt \
        new_service \
        --ms artifacts/char_count.wasm:configs/char_count_cfg.json \
        --name char-count
```

Which gives us a unique service id:

```text
service id: 0ca36b4d-e683-41b7-b4f1-b139667891df
service created successfully
```

Take note of the service id, `0ca36b4d-e683-41b7-b4f1-b139667891df` will be use in `3-browser-to-serive`

## Update 3-browser-to-service

Update 3-browser-to-service to show char count the message. Go to `3-browser-to-service`

### Update aqua whit the new service


```
import "@fluencelabs/aqua-lib/builtin.aqua"

const helloWorldNodePeerId ?= "12D3KooWKnEqMfYo9zvfHmqTLpLdiHXPe4SVqUWcWHDJdFGrSmcA"
const helloWorldServiceId ?= "e5e42966-4ec5-4c18-b818-f457d343cc78"

const charCountNodePeerId ?= "12D3KooWFtf3rfCDAfWwt6oLZYZbDfn9Vn7bv7g6QjjQxUUEFVBt"
const charCountServiceId ?= "0ca36b4d-e683-41b7-b4f1-b139667891df" 

data HelloWorld:
  msg: string
  reply: string

data CharCount:
  msg: string
  count: string

-- The service runs on a Fluence node
service HelloWorld:
    char_count(msg: string) -> CharCount
    hello(from: PeerId) -> HelloWorld

-- The service runs inside browser
service HelloPeer("HelloPeer"):
    hello(message: string) -> string

-- The service runs inside browser
service CharCountPeer("CharCountPeer"):
    char_count(message: string) -> string

func sayHello(targetPeerId: PeerId, targetRelayPeerId: PeerId) -> string:
    -- execute computation on a Peer in the network
    on helloWorldNodePeerId:
        HelloWorld helloWorldServiceId
        comp <- HelloWorld.hello(%init_peer_id%)

    -- send the result to target browser in the background
    co on targetPeerId via targetRelayPeerId:
        res <- HelloPeer.hello(comp.msg)

    -- send the result to the initiator
    <- comp.reply

func charCount(targetPeerId: PeerId, targetRelayPeerId: PeerId, msg: string) -> string:
    -- execute computation on a Peer in the network
    on charCountNodePeerId:
        HelloWorld charCountServiceId
        comp <- HelloWorld.char_count(msg)

    -- send the result to target browser in the background
    co on targetPeerId via targetRelayPeerId:
        res <- CharCountPeer.char_count(comp.count)

    -- send the result to the initiator
    <- comp.count
```

### Compile aqua file
```
npm run compile-aqua
```

### Update App.tsx

In order to use the new service and display de char count you should update this file as is done in `3-browser-to-service/src/App.tsx

### Run the application 

```text
npm start
```

### Play with the app

Which will open a new browser tab at `http://localhost:3000` . Following the instructions, we connect to any one of the displayed relay ids, open another browser tab also at  `http://localhost:3000`, select a relay and copy and  paste the client peer id and relay id into corresponding fields in the first tab and press the `say hello` button.

You will see the message and char count for this message

