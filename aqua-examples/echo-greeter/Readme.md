# Greeting Service

In this example we illustrate the implementation and composition of two services into a decentralized application with Aqua. Specifically, we use a hosted greeting, aka *hello world*, service as a consumer of the output of another hosted service with Aqua. For the purpose of this example let's call our upstream service *echo-service*, which simply echos inputs.  *Echo-service* can be viewed as a placeholder for, say, a database or formatting service.  

## Requirements

To run the example in its entirety, you need to install a few tools. See [Setting Up](https://doc.fluence.dev/docs/tutorials_tutorials/recipes_setting_up) for details. For more developer resources see the [Developer Docs](https://doc.fluence.dev/docs/), [Aqua Book](https://doc.fluence.dev/aqua-book/) and the [Marine Examples](./../../marine-examples).

## Service Development And Deployment

Services are logical constructs comprised of Wasm Interface Types (IT) modules executing on the [Marine](https://github.com/fluencelabs/marine) runtime available on each [Fluence node](https://github.com/fluencelabs/fluence). At this time, Rust is not only the preferred but also the only option to write Wasm modules. For the examples at hand, we need to develop and deploy two services: a greeting service and an echo service where the echo service returns the inputs for the greeting service.

Our [greeting service](./greeting/src/main.rs) is very simple: it takes a name value to return and a boolean value to determine whether our greeting to `name` is *Hi* or *Bye*. As shown below, the code is basic Rust with plus the `marine macro`, which makes sure our code is valid Wasm IT code that can be compiled to our desired `wasmer32-wasi` compile target.

```rust
// greeting-service/src/main.rs

use marine_rs_sdk::marine;
use marine_rs_sdk::module_manifest;

module_manifest!();

pub fn main() {}

#[marine]
pub fn greeting(name: String, greeter: bool) -> String {
    match greeter {
        true => format!("Hi, {}", name),
        false => format!("Bye, {}", name),
    }
}
```

The echo-service, see below, takes a vector of strings, maps each string to the Echo struct and returns the resulting vector of structs.

```rust
// echo-service/src/main.rs
use marine_rs_sdk::marine;
use marine_rs_sdk::module_manifest;

module_manifest!();

#[marine]
pub struct Echo {
    pub echo: String,
}

#[marine]
pub fn echo(inputs: Vec<String>) -> Vec<Echo> {
    inputs
        .iter()
        .map(|s| Echo {
            echo: s.to_string(),
        })
        .collect()
}
```

We can compile our code with the provided build script:

```text
% ./scripts/build_all.sh
```

The build script compiles each of the specified services with the marine compiler and generates two Wasm modules, which are placed in the `artifacts` directory. Before we deploy the service, we can inspect and test each module with the Marine REPL and the `configs/Config.toml` file which contains the metadata with respect to module location, name, etc.

```text
% mrepl configs/Config.toml
Welcome to the Marine REPL (version 0.8.0)
Minimal supported versions
  sdk: 0.6.0
  interface-types: 0.20.0

app service was created with service id = d5974dab-d7dc-4168-9b47-1d9a647a6fa8
elapsed time 82.823341ms

1> interface                         <-- list all public interfaces
Loaded modules interface:
data Echo:
  echo: string

echo_service:                         <-- echo service namespace
  fn echo(inputs: []string) -> []Echo
greeting:                             <-- greeting service namespace
  fn greeting(name: string, greeter: bool) -> string

> call echo_service echo [["jim", "john", "jill"]]
result: Array([Object({"echo": String("jim")}), Object({"echo": String("john")}), Object({"echo": String("jill")})])
 elapsed time: 150.194µs

3> call greeting greeting ["boo", true]
result: String("Hi, boo")
 elapsed time: 128.356µs

4> call greeting greeting ["yah", false]
result: String("Bye, yah")
 elapsed time: 49.64µs
```

Looks like all is working as planned and we're ready to deploy our services to the Fluence testnet. To deploy a service, we need the peer id of our desired host node, which we can get with `fldist env`:

```text
% fldist env
/dns4/kras-00.fluence.dev/tcp/19990/wss/p2p/12D3KooWSD5PToNiLQwKDXsu8JSysCwUt8BVUJEqCHcDe7P5h45e
/dns4/kras-00.fluence.dev/tcp/19001/wss/p2p/12D3KooWR4cv1a8tv7pps4HH6wePNaK6gf1Hww5wcCMzeWxyNw51
/dns4/kras-01.fluence.dev/tcp/19001/wss/p2p/12D3KooWKnEqMfYo9zvfHmqTLpLdiHXPe4SVqUWcWHDJdFGrSmcA
/dns4/kras-02.fluence.dev/tcp/19001/wss/p2p/12D3KooWHLxVhUQyAuZe6AHMB29P7wkvTNMn7eDMcsqimJYLKREf
/dns4/kras-03.fluence.dev/tcp/19001/wss/p2p/12D3KooWJd3HaMJ1rpLY1kQvcjRPEvnDwcXrH8mJvk7ypcZXqXGE
<snip>
/dns4/kras-09.fluence.dev/tcp/19001/wss/p2p/12D3KooWD7CvsYcpF9HE9CCV9aY3SJ317tkXVykjtZnht2EbzDPm
```

Any one of the peers will do and we can deploy our services with the `fldist` tool by providing the peer id of the host node and the location of the Wasm module(s) and configuration file defining the service.  

```text
# deploy greeting service
fldist --node-id 12D3KooWJd3HaMJ1rpLY1kQvcjRPEvnDwcXrH8mJvk7ypcZXqXGE \
       new_service \
       --ms artifacts/greeting.wasm:configs/greeting_cfg.json \
       --name greeting-demo
```

Which gives us the service id for the greeting service:

```text
service id: 9436af06-86ab-4df3-ba2a-ad29e37043c2
service created successfully
```

and

```text
# deploy echo service
fldist --node-id 12D3KooWJd3HaMJ1rpLY1kQvcjRPEvnDwcXrH8mJvk7ypcZXqXGE \
       new_service \
       --ms artifacts/echo_service.wasm:configs/echo_service_cfg.json \
       --name echo-demo
```

Which gives as the id for the echo service:

```text
service id: ff3f3aa0-daeb-4555-b596-0f653df2ace9
service created successfully
```

Take note of the service id for each service deployed as we need the peer and service id to execute each service.

## Building A Decentralized Greeting Application With Aqua

We're ready to build our application with Aqua as our composition medium from the greeting and echo service. Creating Aqua scripts requires the specifications of each service's public API. Marine offers us a convenient way to export Aqua-compatible interface definitions:

```aqua
-- marine aqua artifacts/greeting.wasm
service Greeting:
  greeting(name: string, greeter: bool) -> string

-- marine aqua artifacts/echo_service.wasm
data Echo:
  echo: string

service EchoService:
  echo(inputs: []string) -> []Echo
```

Of course, we can pipe the `marina aqua` interfaces into an aqua file of your choice, e.g. `marine aqua artifacts/greeting.wasm >> aqua-scripts/my_aqua.aqua`, to get things started. Before we dive into the Aqua development, let's compile the already created Aqua program `aqua-scripts\echo_greeter.aqua` with `aqua`:

```text
aqua -i aqua-scripts -o aqua-compiled -a
```

Since we compile with the `-a` flag, we generate aqua intermediate representation (AIR) files which are located in the `air-scripts` directory. Further below, we'll see how to generate ready-to use Typescript stubs generated by the Aqua compiler.  

To make things copacetic for the remainder of this section, we'll be using services already deployed to the Fluence testnet:

```text
echo-services: [("12D3KooWFtf3rfCDAfWwt6oLZYZbDfn9Vn7bv7g6QjjQxUUEFVBt", "fb5f7126-e1ee-4ecf-81e7-20804cb7203b"), ("12D3KooWJd3HaMJ1rpLY1kQvcjRPEvnDwcXrH8mJvk7ypcZXqXGE", "893a6fb8-43b9-4b11-8786-93300bd68bc8")]

greeting-services: [("12D3KooWJd3HaMJ1rpLY1kQvcjRPEvnDwcXrH8mJvk7ypcZXqXGE", "5a03906b-3217-40a2-93fb-7e83be735408"), ("12D3KooWFtf3rfCDAfWwt6oLZYZbDfn9Vn7bv7g6QjjQxUUEFVBt", "5cf520ff-dd65-47d7-a51a-2bf08dfe2ede")]
```

Below is the first attempt at using Aqua to compose our two services into the desired application workflow: the execution of a greeting service for each output provided by the upstream echo service.

```aqua
-- aqua-scripts/echo_greeter.aqua

-- interface struct from echo-service.wsasm
data EchoResult:
  echo: string

-- interface function from echo-service.wsasm
service EchoService:
  echo: []string -> []EchoResult

-- interface function from greeting.wsasm
service GreetingService("service-id"):
  greeting: string, bool -> string

-- Identity function we'll use for join
service OpString("op"):
  identity(s: string) -> string

-- call echo service and and sequentially call greeting service on each name
-- one service, on one node for all processing needs
func echo_greeting_seq(names: []string, greet: bool, node: string, echo_service_id: string, greeting_service_id: string) -> []string:
  res: *string                              <- 1
  on node:                                  <- 2
    EchoService echo_service_id             <- 3
    GreetingService greeting_service_id     <- 4
    echo_names <- EchoService.echo(names)   <- 5
    <- echo_names                           
    for result <- echo_names:               <- 6
      res <- GreetingService.greeting(result.echo, greet)  <- 7
  <- res                                    <- 8
```

The first section of the Aqua file are the public interfaces exposed from the underlying Wasm services, which we obtained earlier. Our composition of the services into our application happens with the `echo_greeting_seq` function. Before we run through the function body, let's have a look at the function signature:

```aqua
-- this function encapsulates our workflow logic
func echo_greeting_seq(names: []string, greet: bool, node: string, echo_service_id: string,greeting_service_id: string) -> []string:
```

Recall that

* the echo service takes an array of strings as input arguments and
* the greeting service takes a string and a boolean as input arguments

Our first two argument slots in `echo_greeting_seq` take care of that. Aside from the actual Wasm function inputs, we also need to provide information with respect to the location and identity of the services we want to utilize. In this instance, we provide service ids for both the echo and greeting service, respectively, and one peer id. This indicates that both services are hosted on the same node, which is possible but not necessary or even desirable.

In the function body we:

1. Declare a streaming variable to accept greeting function returns
2. Specify the node on which we want to execute the following function body
3. Declare the echo-service binding to the specified service id
4. Declare the greeting-service binding to the specified service id
5. Call the echo service with names array taken as a function input
6. Fold over the results (echo_names)
7. Call the Greeting service with a name and the greet parameters in sequence
8. Return the results array

Let's run the compiled Aqua code with the `fldist` cli tool:

```text
fldist run_air \
       -p aqua-compiled/echo_greeter.echo_greeting_seq.air \
       -d '{"names":["jim", "john", "james"],
            "greet": true,
            "node":"12D3KooWJd3HaMJ1rpLY1kQvcjRPEvnDwcXrH8mJvk7ypcZXqXGE", "greeting_service_id":"5a03906b-3217-40a2-93fb-7e83be735408",
            "echo_service_id": "893a6fb8-43b9-4b11-8786-93300bd68bc8"
            }' \
       --generated
```

`fldist` provides a client peer and deploys the compiled Aqua script, with the `-p` flag, and  input data, with the `-d` flag, in form of a json string to the peer-to-peer network for execution and returns expected result:

```text
[
  [
    "Hi, jim",
    "Hi, john",
    "Hi, james"
  ]
]
```

Of course, services need not be deployed to the same node and with some minor adjustments to our Aqua function signature and body, we can accommodate multi-host scenarios rather easily. We also added the `NodeServicePair` structure to make the function signature more compact:

```aqua
-- aqua-scripts/echo_greeter.aqua

-- struct for node, service tuple
data NodeServicePair:
  node: string
  service_id: string

-- revised Aqua function to accommodate (node, service) separation 
func echo_greeting_seq_2(names: []string, greet: bool, echo_topo: NodeServicePair, greeting_topo: NodeServicePair) -> []string:
  res: *string
  on echo_topo.node:
    EchoService echo_topo.service_id
    echo_names <- EchoService.echo(names)
  
  on greeting_topo.node:
    GreetingService greeting_topo.service_id    
    for result <- echo_names:
      res <- GreetingService.greeting(result.echo, greet)
  <- res
```

Since we want to compose services deployed on different nodes, we express this requirement by specifying the (node, service) tuples via `on echo_topo.node` and `on greeting-topo.node` in sequence. That is, the workflow first calls the echo-service followed by three sequential calls on the greeting service.

Again, we can execute our workflow with the `fldist` tool:

```text
 fldist run_air \ 
        -p aqua-compiled/echo_greeter.echo_greeting_seq_2.air \
        -d '{"names":["jim", "john", "james"],
             "greet": true,
             "greeting_topo":{"node":"12D3KooWJd3HaMJ1rpLY1kQvcjRPEvnDwcXrH8mJvk7ypcZXqXGE",
                             "service_id":"5a03906b-3217-40a2-93fb-7e83be735408"},
            "echo_topo": {"node": "12D3KooWFtf3rfCDAfWwt6oLZYZbDfn9Vn7bv7g6QjjQxUUEFVBt",
                          "service_id": "fb5f7126-e1ee-4ecf-81e7-20804cb7203b"}}'
        --generated
```

Regardless of the difference in service hosts, we of course get the expected result:

```text
[
  [
    "Hi, jim",
    "Hi, john",
    "Hi, james"
  ]
]
```

Both workflow examples we've seen are **seq**uentially executing service calls. Let's kick it up a notch and process echo service outputs in **par**allel. Of course, we need to have the necessary greeting services deployed on different peers otherwise parallel processing defaults to sequential processing. Also, to continue to keep things compact, we introduce the `EchoServiceInput` struct.

```aqua

data EchoServiceInput:
  node: string
  service_id: string
  names: []string

-- call parallel with echo service
func echo_greeting_par(greet: bool, echo_service: EchoServiceInput, greeting_services: []NodeServicePair) -> []string:
    res: *string
    on echo_service.node:
        EchoService echo_service.service_id
        echo_results <- EchoService.echo(echo_service.names)
    
    for result <- echo_results:
      par for greeting_service <- greeting_services:      --< parallelization takes place
        GreetingService greeting_service.service_id
        on greeting_service.node:
          res <- GreetingService.greeting(result.echo, greet)
    OpString.identity(res!5)
    <- res
```

In this implementation version, we call the echo-service, just as before, and introduce parallelization when we reach the greeting service fold. That is, each greeting service arm is run in parallel and for each *result*, we execute k greeting services, as specified in greeting_services array, in parallel. Note that as a consequence of the parallelization we need to introduce a `join` on *res* as the result streaming into *res* happens on the specified node and therefore without being visible to the other streaming activities. We accomplish this with the `OpString.identity(res!5)` function where the argument needs to be a literal at this point. 


Our updated `fldist` reads:

```text
fldist run_air \
       -p aqua-compiled/echo_greeter.echo_greeting_par.air  \
       -d '{"echo_service":{"names":["jim", "john", "james"],\
                            "node": "12D3KooWFtf3rfCDAfWwt6oLZYZbDfn9Vn7bv7g6QjjQxUUEFVBt", \
                            "service_id": "fb5f7126-e1ee-4ecf-81e7-20804cb7203b"}, \
            "greeting_services":[{"node":"12D3KooWJd3HaMJ1rpLY1kQvcjRPEvnDwcXrH8mJvk7ypcZXqXGE", \
                                  "service_id":"5a03906b-3217-40a2-93fb-7e83be735408"}, \
                                 {"node":"12D3KooWFtf3rfCDAfWwt6oLZYZbDfn9Vn7bv7g6QjjQxUUEFVBt", \
                                  "service_id":"5cf520ff-dd65-47d7-a51a-2bf08dfe2ede"}], \
            "greet": true}' \
            --generated
```

And our result is:

```text

  [
    "Hi, jim",
    "Hi, jim",
    "Hi, john",
    "Hi, john",
    "Hi, james",
    "Hi, james"
  ]
]
```

Since we got three input names and two greeting services, we expect, and got, six results where the parallelization is on each echo-service result. Of course, we can change the point of parallelization to cover the echo-service results array for each provided service. Our updated Auqa composition function now reads:

```aqua
-- call parallel with echo service, alternate version
func echo_greeting_par_alternative(greet: bool, echo_service: EchoServiceInput, greeting_services: []NodeServicePair) -> []string:
    res: *string
    on echo_service.node:
        EchoService echo_service.service_id
        echo_results <- EchoService.echo(echo_service.names)
    
    for result <- echo_results:
      for greeting_service <- greeting_services:
        GreetingService greeting_service.service_id
        par on greeting_service.node:                               --< Parallelization at the array level
          res <- GreetingService.greeting(result.echo, greet)
    OpString.identity(res!5)
    <- res
```

And running the workflow with the updated data:

```text
fldist run_air \
       -p aqua-compiled/echo_greeter.echo_greeting_par_inverse.air \
       -d '{"echo_service":{"names":["jim", "john", "james"],
                            "node": "12D3KooWFtf3rfCDAfWwt6oLZYZbDfn9Vn7bv7g6QjjQxUUEFVBt",
                            "service_id": "fb5f7126-e1ee-4ecf-81e7-20804cb7203b"},
            "greeting_services":[{"node":"12D3KooWJd3HaMJ1rpLY1kQvcjRPEvnDwcXrH8mJvk7ypcZXqXGE",
                                  "service_id":"5a03906b-3217-40a2-93fb-7e83be735408"},
                                  {"node":"12D3KooWFtf3rfCDAfWwt6oLZYZbDfn9Vn7bv7g6QjjQxUUEFVBt",
                                   "service_id":"5cf520ff-dd65-47d7-a51a-2bf08dfe2ede"}],
            "greet": true}' \
       --generated
```

gives us the updated result:

```text
[
  [
    "Hi, jim",
    "Hi, john",
    "Hi, james",
    "Hi, jim",
    "Hi, john",
    "Hi, james"
  ]
```

With a very minor modification, i.e., the placement of `par`, we can drastically later the (re-)use of deployed services!

With some additional modifications to our Aqua function, we can further improve readability by supplying the *greet* parameter for each service. Let's add a `GreetingServiceInput` struct and update the function signatures and bodies:

```aqua
data GreetingServiceInput:
  node: string
  service_id: string
  greet: bool

func echo_greeting_par_improved(echo_service: EchoServiceInput, greeting_services: []GreetingServiceInput) -> []string:
    res: *string
    on echo_service.node:
        EchoService echo_service.service_id
        echo_results <- EchoService.echo(echo_service.names)
    
    for result <- echo_results:
      par for greeting_service <- greeting_services:
        GreetingService greeting_service.service_id
        on greeting_service.node:
          res <- GreetingService.greeting(result.echo, greeting_service.greet). --< update
    OpString.identity(res!5)
    <- res
```

Run the workflow with the updated json string:


```test
fldist run_air 
       -p aqua-compiled/echo_greeter.echo_greeting_par_improved.air \
       -d '{"echo_service":{"names":["jim", "john", "james"],
                            "node": "12D3KooWFtf3rfCDAfWwt6oLZYZbDfn9Vn7bv7g6QjjQxUUEFVBt",
                            "service_id": "fb5f7126-e1ee-4ecf-81e7-20804cb7203b"},
            "greeting_services":[{"node":"12D3KooWJd3HaMJ1rpLY1kQvcjRPEvnDwcXrH8mJvk7ypcZXqXGE",
                                  "service_id":"5a03906b-3217-40a2-93fb-7e83be735408",
                                  "greet":true},
                                  {"node":"12D3KooWFtf3rfCDAfWwt6oLZYZbDfn9Vn7bv7g6QjjQxUUEFVBt",
                                  "service_id":"5cf520ff-dd65-47d7-a51a-2bf08dfe2ede",
                                  "greet":false}]}' \
      --generated
```

Which gives us:

```text
[
  [
    "Hi, jim",
    "Bye, jim",
    "Hi, john",
    "Bye, john",
    "Hi, james",
    "Bye, james"
  ]
]
```

Again, with very minor adjustments to our Aqua function, we can significantly improve the re-use of already deployed services.

In this section, we explored how we can use Aqua to program hosted services into applications. Along the way, we investigated sequential and parallel workflows and discovered that changes in processing or workflow logic are taken care of at the Aqua level not requiring any changes to the deployed services. Throughout our experimentation with Aqua and deployed services, we used the `fldist` tool as our local cli client peer. In the next section, we introduce the development and use of a Typescript client peer.  

### Developing And Working With A Typescript Client

In the previous section we used `fldist` as our local peer client to run the execution of our compiled Aqua scripts on the network. Alternatively, Aqua code can be directly compiled to Typescript utilizing the Fluence [JS-SDK](https://github.com/fluencelabs/fluence-js).

Let's install the required packages:

```text
cd client-peer
npm install
```

And compile our Aqua file to a Typescript stub:

```text
npm run compile-aqua

> echo-greeter-example@0.1.0 compile-aqua /Users/bebo/localdev/examples-rework/aqua-examples/echo-greeter/client-peer
> aqua -i ../aqua-scripts -o src/

[info] Aqua Compiler 0.1.14-207
[info] Result /Users/bebo/localdev/examples-rework/aqua-examples/echo-greeter/client-peer/src/echo_greeter.ts: compilation OK (6 functions)
```

The ensuing, auto-generated file is called `echo_greeter.ts` and was copied to the `src` directory. The Aqua compiler auto-generated the Typescript functions corresponding to each of the Aqua functions we implemented. All we have to do is use them!

Let's look at the simple `src/index.ts` implementation using each of the workflow functions: 


```typescript
// src/index.ts

import { createClient, setLogLevel, FluenceClient } from "@fluencelabs/fluence";
import { krasnodar, Node } from "@fluencelabs/fluence-network-environment";
import {
    echo,
    greeting,
    echo_greeting_seq,
    echo_greeting_par,
    echo_greeting_par_alternative
} from "./echo_greeter";

interface EchoResult {
    echo: string;
}
interface NodeServicePair {
    node: string;
    service_id: string;
}

interface EchoService {
    node: string;
    service_id: string;
    names: Array<string>;
}

interface GreetingService {
    node: string;
    service_id: string;
    greet: boolean;
}

let greeting_topos: Array<NodeServicePair> = [
    {
        node: "12D3KooWFtf3rfCDAfWwt6oLZYZbDfn9Vn7bv7g6QjjQxUUEFVBt",
        service_id: "5cf520ff-dd65-47d7-a51a-2bf08dfe2ede",
    },
    {
        node: "12D3KooWJd3HaMJ1rpLY1kQvcjRPEvnDwcXrH8mJvk7ypcZXqXGE",
        service_id: "5a03906b-3217-40a2-93fb-7e83be735408",
    },
];
let echo_topos: Array<NodeServicePair> = [
    {
        node: "12D3KooWFtf3rfCDAfWwt6oLZYZbDfn9Vn7bv7g6QjjQxUUEFVBt",
        service_id: "fb5f7126-e1ee-4ecf-81e7-20804cb7203b",
    },
    {
        node: "12D3KooWJd3HaMJ1rpLY1kQvcjRPEvnDwcXrH8mJvk7ypcZXqXGE",
        service_id: "893a6fb8-43b9-4b11-8786-93300bd68bc8",
    },
];
let echo_service: EchoService = {
    node: echo_topos[0].node,
    service_id: echo_topos[0].service_id,
    names: ["Jim", "John", "Jake"],
};
let greeting_services: Array<GreetingService> = [
    {
        node: greeting_topos[0].node,
        service_id: greeting_topos[0].service_id,
        greet: true,
    },
    {
        node: greeting_topos[1].node,
        service_id: greeting_topos[1].service_id,
        greet: false,
    },
];

let names: Array<string> = ["Jim", "John", "Jake"];

// let greeting_service =

async function main() {
    // console.log("hello");
    // setLogLevel('DEBUG');

    const fluence = await createClient(krasnodar[2]);
    console.log(
        "created a fluence client %s with relay %s",
        fluence.selfPeerId,
        fluence.relayPeerId
    );


    let echo_result = await echo(
        fluence,
        names,
        echo_topos[0].node,
        echo_topos[0].service_id
    );
    let result = "";
    for (let item of echo_result) {
        result += item.echo + ","
    }
    console.log("echo result                       : ", result);

    let greeting_result = await greeting(
        fluence,
        names[0],
        true,
        greeting_topos[0].node,
        greeting_topos[0].service_id
    );
    console.log("greeting result                   : ", greeting_result);

    // echo_greeting_par(greet: bool, echo_service: EchoServiceInput, greeting_services: []NodeServicePair) -> []string:
    let seq_result = await echo_greeting_seq(
        fluence,
        names,
        true,
        echo_topos[0].node,
        echo_topos[0].service_id,
        greeting_topos[0].service_id
    );
    console.log("seq result                         : ", seq_result);


    let par_result = await echo_greeting_par(
        fluence,
        true,
        echo_service,
        greeting_services
    );
    console.log("par result                          : ", par_result);


    par_result = await echo_greeting_par_alternative(
        fluence,
        true,
        echo_service,
        greeting_services
    );
    console.log("par alternative result              : ", par_result);

    par_result = await echo_greeting_par_improved(
        fluence,
        echo_service,
        greeting_services
    );
    console.log("par improved signature result        : ", par_result);



    return;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
```

The client implementation:

* Imports the necessary js-sdk
* Imports the Fluence test network information
* Imports the Aqua auto-generated workflow functions
* Declares the node and service data and corresponding structs
* Creates a client handler for our selected testnet and relay node
* Runs and logs each of the workflow functions

Let's run our client peer:

```text
npm run start
```

Which gives us the same results as before:

```text
created a fluence client 12D3KooWRE4k3qT8Z5x22EjGF3g8vkvo7nPWbkQxRowxkTgfBM6A with relay 12D3KooWKnEqMfYo9zvfHmqTLpLdiHXPe4SVqUWcWHDJdFGrSmcA
echo result                       :  Jim,John,Jake,
greeting result                   :  Hi, Jim
seq result                         :  [ 'Hi, Jim', 'Hi, John', 'Hi, Jake' ]
par result                          :  [
  'Hi, Jim',
  'Hi, Jim',
  'Hi, John',
  'Hi, John',
  'Hi, Jake',
  'Hi, Jake'
]
par alternative result              :  [
  'Hi, Jim',
  'Hi, John',
  'Hi, Jake',
  'Hi, Jim',
  'Hi, John',
  'Hi, Jake'
]
par improved signature result        :  [
  'Hi, Jim',
  'Bye, Jim',
  'Hi, John',
  'Bye, John',
  'Hi, Jake',
  'Bye, Jake'
]
```
