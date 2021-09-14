# 4. Hosted Services (Character Count)

### Creating A WebAssembly Module

In this section, we develop a simple `CharacterCount` service and host it on a peer-to-peer node of the Fluence testnet. In your VSCode IDE, change to the `4-hosted-services` directory and open the `src/main.rs` file:


Fluence hosted services are comprised of WebAssembly modules implemented in Rust and compiled to [wasm32-wasi](https://doc.rust-lang.org/stable/nightly-rustc/rustc_target/spec/wasm32_wasi/index.html). Let's have look at our code:

```rust
// quickstart/4-hosted-services/src/main.rs
use marine_rs_sdk::marine;
use marine_rs_sdk::module_manifest;
module_manifest!();

pub fn main() {}

#[marine]
pub struct CharacterCount {
    pub message: String,
    pub character_count: String,
}

#[marine]
pub fn count(message: String) -> CharacterCount {
    CharacterCount {
        message: format!("{}", message),
        character_count: format!("char count: {} chars", message.chars().count())
    }
}
```

At the core of our implementation is the `count` function which takes a string parameter and returns the `CharacterCount` struct consisting of the `message` and `character_count` field, respectively. We can use the `build.sh` script in the `scripts` directory,  `./scripts/build.sh` ,  to compile the code to the Wasm target from the VSCode terminal.

Aside from some housekeeping, the `build.sh` script gives the compile instructions with [marine](https://crates.io/crates/marine), `marine build --release` , and copies the resulting Wasm module, `character_count.wasm`, to the `artifacts` directory for easy access.

### Testing And Exploring Wasm Code

So far, so good. Of course, we want to test our code and we have a couple of test functions in our `main.rs` file:

```rust
// quickstart/2-hosted-services/src/main.rs
use marine_rs_sdk::marine;
use marine_rs_sdk::module_manifest;

//<snip>
#[cfg(test)]
mod tests {
    use marine_rs_sdk_test::marine_test;

    #[marine_test(config_path = "../configs/Config.toml", modules_dir = "../artifacts")]
    fn non_empty_string(character_count: marine_test_env::character_count::ModuleInterface) {
        let actual = character_count.count("Hello world message!".to_string());
        assert_eq!(actual.character_count, "char count: 20 chars".to_string());
    }

    #[marine_test(config_path = "../configs/Config.toml", modules_dir = "../artifacts")]
    fn empty_string(character_count: marine_test_env::character_count::ModuleInterface) {
        let actual = character_count.count("".to_string());
        assert_eq!(actual.character_count, "char count: 0 chars");
    }
}


```

  
 To run our tests, we can use the familiar[`cargo test`](https://doc.rust-lang.org/cargo/commands/cargo-test.html) . However, we don't really care all that much about our native Rust functions being tested but want to test our WebAssembly functions. This is where the extra code in the test module comes into play. In short., we are running `cargo test` against the exposed interfaces of the `character_count.wasm` module and in order to do that, we need the `marine_test` macro and provide it with both the modules directory, i.e., the `artifacts` directory, and the location of the `Config.toml` file. Note that the `Config.toml` file specifies the module metadata and optional module linking data. Moreover, we need to call our Wasm functions from the module namespace, i.e. `character_count.count` instead of the standard `count` -- see lines 12 and 18 above, which we specify as an argument in the test function signature \(lines 10 and 16, respectively\).

{% hint style="info" %}
In order to able able to use the macro, install the [`marine-rs-sdk-test`](https://crates.io/crates/marine-rs-sdk-test) crate as a dev dependency:

`[dev-dependencies] marine-rs-sdk-test = "`&lt;version&gt;`"`
{% endhint %}

From the VSCode terminal, we now run our tests with the`cargo +nightly test --release` command. Please note that if `nightly` is your default, you don't need it in your `cargo test` command.

![Cargo test using Wasm module](../.gitbook/assets/image%20%2833%29.png)

Well done -- our tests check out. Before we deploy our service to the network, we can interact with it locally using the [Marine REPL](https://crates.io/crates/mrepl). In your VSCode terminal the `4-hosted-services` directory run:

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

app service was created with service id = 8a2d946d-b474-468c-8c56-9e970ee64743
elapsed time 53.593404ms

1> i
Loaded modules interface:
data CharacterCount:
  message: string
  character_count: string

character_count:
  fn count(message: string) -> CharacterCoun

2> call character_count count ["Fluence"]
result: Object({"character_count": String("char count: 7 chars"), "message": String("Fluence")})
 elapsed time: 247.867µs

3> 
```

We can explore the available interfaces with the `i` command and see that the interfaces we marked with the `marine` macro in our Rust code above are indeed exposed and available for consumption. Using the `call` command, still in the REPL, we can access any available function in the module namespace, e.g., `call character_count count [<string arg>]`. You can exit the REPL with the `ctrl-c` command.

### Exporting WebAssembly Interfaces To Aqua

In anticipation of future needs, note that `marine` allows us to export  the Wasm interfaces ready for use in Aqua. In your VSCode terminal, navigate to the \`\` directory 

```text
marine aqua artifacts/character_count.wasm
```

Which gives us the Aqua-ready interfaces:

```haskell
module CharacterCount declares *

data CharacterCount:
  message: string
  character_count: string

service CharacterCount:
  count(message: string) -> CharacterCount
```

That can be piped directly into an aqua file , e.g., \``marine aqua my_wasm.wasm >> my_aqua.aqua`. 

### Deploying A Wasm Module To The Network

Looks like all is in order with our module and we are ready to deploy our `CharacterCount` service to the world by means of the Fluence peer-to-peer network. For this to happen, we need two things: the peer id of our target node\(s\) and a way to deploy the service. The latter can be accomplished with the `fldist` command line tool and with respect to the former, we can get a peer from one of the Fluence testnets also with `fldist` . In your VSCode terminal:

```text
fldist env
```

Which gets us a list of network peers:

```text
/dns4/kras-00.fluence.dev/tcp/19990/wss/p2p/12D3KooWSD5PToNiLQwKDXsu8JSysCwUt8BVUJEqCHcDe7P5h45e
/dns4/kras-00.fluence.dev/tcp/19001/wss/p2p/12D3KooWR4cv1a8tv7pps4HH6wePNaK6gf1Hww5wcCMzeWxyNw51
/dns4/kras-01.fluence.dev/tcp/19001/wss/p2p/12D3KooWKnEqMfYo9zvfHmqTLpLdiHXPe4SVqUWcWHDJdFGrSmcA
/dns4/kras-02.fluence.dev/tcp/19001/wss/p2p/12D3KooWHLxVhUQyAuZe6AHMB29P7wkvTNMn7eDMcsqimJYLKREf
/dns4/kras-03.fluence.dev/tcp/19001/wss/p2p/12D3KooWJd3HaMJ1rpLY1kQvcjRPEvnDwcXrH8mJvk7ypcZXqXGE
/dns4/kras-04.fluence.dev/tcp/19001/wss/p2p/12D3KooWFEwNWcHqi9rtsmDhsYcDbRUCDXH84RC4FW6UfsFWaoHi
/dns4/kras-05.fluence.dev/tcp/19001/wss/p2p/12D3KooWCMr9mU894i8JXAFqpgoFtx6qnV1LFPSfVc3Y34N4h4LS
/dns4/kras-06.fluence.dev/tcp/19001/wss/p2p/12D3KooWDUszU2NeWyUVjCXhGEt1MoZrhvdmaQQwtZUriuGN1jTr
/dns4/kras-07.fluence.dev/tcp/19001/wss/p2p/12D3KooWEFFCZnar1cUJQ3rMWjvPQg6yMV2aXWs2DkJNSRbduBWn
/dns4/kras-08.fluence.dev/tcp/19001/wss/p2p/12D3KooWFtf3rfCDAfWwt6oLZYZbDfn9Vn7bv7g6QjjQxUUEFVBt
/dns4/kras-09.fluence.dev/tcp/19001/wss/p2p/12D3KooWD7CvsYcpF9HE9CCV9aY3SJ317tkXVykjtZnht2EbzDPm
```

Let's use the peer`12D3KooWFEwNWcHqi9rtsmDhsYcDbRUCDXH84RC4FW6UfsFWaoHi` as our deployment target and deploy our service from the VSCode terminal. In the `quickstart/4-hosted-services` directory run:

```bash
fldist --node-id 12D3KooWFEwNWcHqi9rtsmDhsYcDbRUCDXH84RC4FW6UfsFWaoHi \
       new_service \
       --ms artifacts/character_count.wasm:configs/character_count.json \
       --name character-count 
```

Which gives us a unique service id:

```text
service id: 25ffcd85-d73d-4a39-91a4-a8ed9e0a6483
service created successfully
```

Take note of the service id, `25ffcd85-d73d-4a39-91a4-a8ed9e0a6483` in this example but different for you, as we need it to use the service with Aqua.

Congratulations, we just deployed our first reusable service to the Fluence network and we can admire our handiwork on the Fluence [Developer Hub](https://dash.fluence.dev/):

![HelloWorld service deployed to peer 12D3Koo...WaoHi](../.gitbook/assets/image%20%2822%29.png)

With our newly created service ready to roll, let's move on and put it to work.

