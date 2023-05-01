use crate::glaze_adapter::glaze_request;
use crate::ceramic_common::Result;
use serde_json::json;
use marine_rs_sdk::marine;

#[marine]
pub fn did_create() -> Result {
    // create a new DID
    let cmd = "did:create";
    let args = vec![cmd.to_owned()];

    let res = glaze_request(args);

    let mut stdout = String::from_utf8(res.stderr).unwrap();
    let mut stderr = String::from_utf8(res.stdout).unwrap();

    if stdout.contains("Created DID") {
        let s: Vec<&str> = stdout.split("DID ").collect();
        let s = s[1].replace("\n", "");
        let did_sk: Vec<&str> = s.split(" with seed ").collect();
        let pk = did_sk[0].clone().split(":").collect::<Vec<&str>>();
        let pk = pk.last().unwrap();
        let obj = json!({"did": did_sk[0], "pk":pk,"sk": did_sk[1]});
        stdout = obj.to_string();
        stderr = "".to_string();
    }

    Result { stdout, stderr }
}