use crate::ceramic_common::Result;
use marine_rs_sdk::marine;
use crate::glaze_adapter::glaze_request;

#[marine]
fn config_get() -> Result {
    let cmd = "config:show";
    let args = vec![cmd.to_owned()];

    let res = glaze_request(args);

    let mut stdout = String::from_utf8(res.stdout).unwrap();
    let mut stderr = String::from_utf8(res.stderr).unwrap();

    if stdout.contains("Ceramic API URL") {
        let s = stdout.split(" ceramic-url ").collect::<Vec<&str>>()[1];
        let s = s.replace("\u{1b}[90m│\u{1b}[39m ","").replace(" \u{1b}[90m│\u{1b}[39m\n\u{1b}[90m└─────────────────\u{1b}[39m\u{1b}[90m┴─────────────\u{1b}[39m\u{1b}[90m┴───────────────────────┘\u{1b}[39m\n","");
        let obj = serde_json::json!({ "api": s }).to_string();

        stdout = obj;
        stderr = "".to_string();
    }

    Result {
        stdout: stdout,
        stderr: stderr,
    }
}
