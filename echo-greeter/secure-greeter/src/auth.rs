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

pub fn is_owner() -> bool {
    let meta = marine_rs_sdk::get_call_parameters();
    let caller = meta.init_peer_id;
    let owner = meta.service_creator_peer_id;

    caller == owner
}

#[marine]
#[allow(dead_code)]
pub fn am_i_owner() -> bool {
    is_owner()
}
