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