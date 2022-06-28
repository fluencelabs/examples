# Marine Starter Template

Get started quickly with your Wasm project with this template.
To use this template you should have the following components available:

* Rust [installation instructions](https://www.rust-lang.org/tools/install)
* Cargo Generate [installation instructions](https://github.com/cargo-generate/cargo-generate#installation)
* Marine [installation instructions](https://github.com/cargo-generate/cargo-generate#installation)

Use the template with `cargo generate`:

```bash
cargo generate cargo generate --git https://github.com/boneyard93501/fluence-template.git
```

Which will prompt you for the project name and then generate the project, which will be your directory name. `cd` into your new directory and run `./scripts/build.sh` to compile the supplied __greeting__ function to a Wasm file ready for deployment.

Check out the [Fluence documentation](https://doc.fluence.dev/docs/) for more details on Marine and Aqua.
