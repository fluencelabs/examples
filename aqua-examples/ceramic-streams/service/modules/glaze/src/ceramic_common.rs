use marine_rs_sdk::marine;

#[marine]
pub struct Result {
    pub stdout: String,
    pub stderr: String,
}

#[marine]
pub fn rsplitter(s: String, token: String) -> String {
    let res: Vec<&str> = s.split(&token).collect();
    if res.len() == 2 {
        let res = res[1]
            .replace("\"", "")
            .replace("'", "")
            .replace("{", "")
            .replace("}", "");
        return res.to_string();
    }
    "".to_string()
}
