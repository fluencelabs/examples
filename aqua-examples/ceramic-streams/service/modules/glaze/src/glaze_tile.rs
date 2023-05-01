use crate::ceramic_common::Result;
use marine_rs_sdk::marine;
use crate::glaze_adapter::glaze_request;

#[marine]
pub fn tile_create(payload: String, commit_id: String, sk: String) -> Result {
    let mut args = vec![
        "tile:create".to_owned(),
        "--key".to_owned(),
        sk,
        "--content".to_owned(),
        payload,
    ];

    if commit_id.chars().count() > 0 {
        args.push("--metadata".to_owned());
        args.push(format!("{{\"schema\": {} }}", commit_id));
    }

    let res = glaze_request(args);
    let mut stdout = String::from_utf8(res.stdout).unwrap();
    let mut stderr = String::from_utf8(res.stderr).unwrap();

    if stderr.contains("Created stream") {
        let s: Vec<&str> = stderr.split("Creating stream...\n✔").collect();
        let sid = s[1]
            .strip_suffix("\n")
            .unwrap_or("")
            .trim()
            .replace("Created stream ", "")
            .replace(".", "");

        let did = s[0]
            .trim()
            .replace("-", "")
            .strip_suffix("\n")
            .unwrap_or(s[0])
            .replace("Using DID ", "");
        let did = did.split("ℹ ").collect::<Vec<&str>>()[1];

        let obj = serde_json::json!({"stream_id": sid, "did":did});
        stdout = obj.to_string();
        stderr = "".to_string()
    }

    Result {
        stdout: stdout,
        stderr: stderr,
    }
}

#[marine]
pub fn tile_show(stream_id: String) -> Result {
    let args = vec!["tile:show".to_owned(), stream_id];

    let res = glaze_request(args);
    let mut stderr = String::from_utf8(res.stderr).unwrap();
    let mut stdout = String::from_utf8(res.stdout).unwrap();

    if stderr.contains("Loading stream") && stdout.chars().count() > 0 {
        let s = stdout
            .trim()
            .replace("\u{1b}[32m", "")
            .replace("\u{1b}[39m }", "")
            .replace("\n", "");

        let s: Vec<&str> = s.split(":").collect();
        let k = s[0].trim().replace("{", "");
        let v = s[1].trim().replace("}", "").replace("'", "");
        let obj = serde_json::json!({ k: v }).to_string();

        stdout = obj;
        stderr = "".to_string();
    }

    Result {
        stdout: stdout,
        stderr: stderr,
    }
}

#[marine]
pub fn tile_update(stream_id: String, payload: String, metadata: String, sk: String) -> Result {
    let mut args = vec![
        "tile:update".to_owned(),
        stream_id,
        "--key".to_owned(),
        sk,
        "--content".to_owned(),
        payload,
    ];

    if metadata.len() > 0 {
        args.push("--metadata".to_owned());
        // args.push(format!("{{\"schema\": {} }}", metadata));
        args.push(metadata.to_owned());
    }

    let res = glaze_request(args);
    let mut stderr = String::from_utf8(res.stderr).unwrap();
    let mut stdout = String::from_utf8(res.stdout).unwrap();

    if stdout.contains("streamID") {
        let s: Vec<&str> = stdout.split("content: ").collect();
        let s = s[1]
            .trim()
            .replace("\u{1b}[32m", "")
            .replace("\u{1b}[39m }", "")
            .replace("\n", "");
        let s: Vec<&str> = s.split(":").collect();
        let k = s[0].trim().replace("{", "");
        let v = s[1].trim().replace("}", "").replace("'", "");
        let obj = serde_json::json!({ k: v }).to_string();

        stdout = obj;
        stderr = "".to_string();
    }

    Result {
        stdout: stdout,
        stderr: stderr,
    }
}


