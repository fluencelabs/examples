use crate::ceramic_common::Result;
use marine_rs_sdk::marine;
use serde_json::json;
use crate::glaze_adapter::glaze_request;

#[marine]
pub fn model_create(model_name: String) -> Result {
    let args = vec!["model:create".to_owned(), model_name];

    let res = glaze_request(args);
    let stdout = String::from_utf8(res.stdout).unwrap();
    let stderr = String::from_utf8(res.stderr).unwrap();

    Result {
        stdout: stdout,
        stderr: stderr,
    }
}

#[marine]
pub fn model_delete(model_name: String) -> Result {
    let args = vec!["model:delete".to_owned(), "-f".to_owned(), model_name];

    let res = glaze_request(args);

    let mut stdout = String::from_utf8(res.stdout).unwrap();
    let mut stderr = String::from_utf8(res.stderr).unwrap();

    if stderr.contains("successfully delete") {
        stdout = json!({"deleted": true}).to_string();
        stderr = "".to_string();
    }

    Result {
        stdout: stdout,
        stderr: stderr,
    }
}

#[marine]
pub fn model_add_schema(
    model_name: String,
    schema_name: String,
    schema: String,
    sk: String,
) -> Result {
    let args = vec![
        "model:add".to_owned(),
        model_name,
        "schema".to_owned(),
        schema_name,
        schema,
        "--key".to_owned(),
        sk,
    ];

    let res = glaze_request(args);
    let stdout = String::from_utf8(res.stderr).unwrap();
    let stderr = String::from_utf8(res.stdout).unwrap();

    Result {
        stdout: stdout,
        stderr: stderr,
    }
}

#[marine]
pub fn model_add_definition(
    model_name: String,
    definition_name: String,
    definition: String,
    sk: String,
) -> Result {
    let args = vec![
        "model:add".to_owned(),
        model_name,
        "definition".to_owned(),
        definition_name,
        definition,
        "--key".to_owned(),
        sk,
    ];

    let res = glaze_request(args);
    let stdout = String::from_utf8(res.stderr).unwrap();
    let stderr = String::from_utf8(res.stdout).unwrap();

    Result {
        stdout: stdout,
        stderr: stderr,
    }
}

#[marine]
pub fn model_add_tile(
    model_name: String,
    tile_name: String,
    tile_data: String,
    sk: String,
) -> Result {
    let args = vec![
        "model:add".to_owned(),
        model_name,
        "tile".to_owned(),
        tile_name,
        tile_data,
        "--key".to_owned(),
        sk,
    ];

    let res = glaze_request(args);
    let stdout = String::from_utf8(res.stderr).unwrap();
    let stderr = String::from_utf8(res.stdout).unwrap();

    Result {
        stdout: stdout,
        stderr: stderr,
    }
}

#[marine]
pub fn model_inspect(model_name: String) -> Result {
    let args = vec!["model:inspect".to_owned(), model_name];

    let res = glaze_request(args);
    let stdout = String::from_utf8(res.stderr).unwrap();
    let stderr = String::from_utf8(res.stdout).unwrap();

    Result {
        stdout: stdout,
        stderr: stderr,
    }
}

#[marine]
pub fn model_deploy(model_name: String) -> Result {
    let args = vec!["model:deploy".to_owned(), model_name];

    let res = glaze_request(args);
    let stdout = String::from_utf8(res.stderr).unwrap();
    let stderr = String::from_utf8(res.stdout).unwrap();

    Result {
        stdout: stdout,
        stderr: stderr,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const MODEL_NAME: &'static str = "test_model";

    #[test]
    fn test_model_create() {
        let res = model_create(MODEL_NAME);
        println!("create: {:?}", res);
    }
}
