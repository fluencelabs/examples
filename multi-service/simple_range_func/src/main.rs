use fluence::fce;

fn main() {}

#[fce]
fn simple_range_list(start: i64, step: u32, n: u32) -> Vec<i64> {
    let mut result: Vec<i64> = Vec::new();
    let stop = start - n as i64;
    for x in (start..stop).step_by(step as usize) {
        result.push(x);
    }
    result
}
