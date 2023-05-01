use crate::ceramic_common::Result;
use marine_rs_sdk::marine;
use serde_json::json;
use crate::glaze_adapter::glaze_request;

#[marine]
pub fn stream_commits(stream_id: String) -> Result {
    let args = vec!["stream:commits".to_owned(), stream_id];

    let res = glaze_request(args);
    let mut stderr = String::from_utf8(res.stderr).unwrap();
    let mut stdout = String::from_utf8(res.stdout).unwrap();

    if stderr.contains("Stream commits loaded") && stdout.chars().count() > 0 {
        let s = stdout
            .replace("[\n  \u{1b}[32m", "")
            .replace("'\u{1b}[39m,\n", "");
        let s = s.split(" ").collect::<Vec<&str>>()[0];
        stdout = json!({ "commit_id": s }).to_string();
        stderr = "".to_string();
    }

    Result {
        stdout: stdout,
        stderr: stderr,
    }
}
