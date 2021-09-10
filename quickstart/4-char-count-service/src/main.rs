/*
 * Copyright 2021 Fluence Labs Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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