# SQLite Example



## Overview



[SQLite](https://www.sqlite.org/index.html) is ubiquitous persistence solution also available in the Fluence stack. Unlike basic compute modules, using SQLite in a service is a little more intricate. In order to create a service, one needs two dependencies:
- SQLite Wasm module that one can get either in a form of a [released module](https://github.com/fluencelabs/sqlite/releases/tag/v0.17.1_w) or build it from scratch following [this](https://github.com/fluencelabs/sqlite) readme.
- SQLite connector that is [WASM IT compliant](https://crates.io/crates/marine-sqlite-connector) [sqlite](https://github.com/fluencelabs/sqlite-wasm-connector) package implementation.

For the purpose of this example, we use the release version -- see `build.sh`.



As a result, our service is comprised of two modules: the SQLite Wasm module and our sqlite module.



## How to build



To build the Wasm modules needed run the following command:



```

$build.sh

```



Upon a successful build there will be a pair of wasm modules:



```
$ls artifacts

sqlite3.wasm sqlite_test.wasm
```



## How to use



Here is a simple 'CREATE-INSERT-SELECT' scenario using the Wasm modules in the artifacts directory. To follow along, you need marine and mrepl installed.

```bash
$cargo install marine mrepl
...
$mrepl -q Config.toml

1> call sqlite_test sql_repl []
For exit type QUIT;
SQL> CREATE VIRTUAL TABLE demo_index USING rtree(
        id,
        minX, maxX,
        minY, maxY
);
CREATE VIRTUAL TABLE demo_index USING rtree( id, minX, maxX, minY, maxY )

SQL> INSERT INTO demo_index VALUES
                (28215, -80.781227, -80.604706, 35.208813, 35.297367),
                (28216, -80.957283, -80.840599, 35.235920, 35.367825),
                (28217, -80.960869, -80.869431, 35.133682, 35.208233),
                (28226, -80.878983, -80.778275, 35.060287, 35.154446),
                (28227, -80.745544, -80.555382, 35.130215, 35.236916),
                (28244, -80.844208, -80.841988, 35.223728, 35.225471),
                (28262, -80.809074, -80.682938, 35.276207, 35.377747),
                (28269, -80.851471, -80.735718, 35.272560, 35.407925),
                (28270, -80.794983, -80.728966, 35.059872, 35.161823),
                (28273, -80.994766, -80.875259, 35.074734, 35.172836),
                (28277, -80.876793, -80.767586, 35.001709, 35.101063),
                (28278, -81.058029, -80.956375, 35.044701, 35.223812),
                (28280, -80.844208, -80.841972, 35.225468, 35.227203),
                (28282, -80.846382, -80.844193, 35.223972, 35.225655);
INSERT INTO demo_index VALUES (28215, -80.781227, -80.604706, 35.208813, 35.297367), (28216, -80.957283, -80.840599, 35.235920, 35.367825), (28217, -80.960869, -80.869431, 35.133682, 35.208233), (28226, -80.878983, -80.778275, 35.060287, 35.154446), (28227, -80.745544, -80.555382, 35.130215, 35.236916), (28244, -80.844208, -80.841988, 35.223728, 35.225471), (28262, -80.809074, -80.682938, 35.276207, 35.377747), (28269, -80.851471, -80.735718, 35.272560, 35.407925), (28270, -80.794983, -80.728966, 35.059872, 35.161823), (28273, -80.994766, -80.875259, 35.074734, 35.172836), (28277, -80.876793, -80.767586, 35.001709, 35.101063), (28278, -81.058029, -80.956375, 35.044701, 35.223812), (28280, -80.844208, -80.841972, 35.225468, 35.227203), (28282, -80.846382, -80.844193, 35.223972, 35.225655)

SQL> SELECT A.id FROM demo_index AS A, demo_index AS B
                    WHERE A.maxX>=B.minX AND A.minX<=B.maxX
                    AND A.maxY>=B.minY AND A.minY<=B.maxY
                    AND B.id=28269 ORDER BY 1;
SELECT A.id FROM demo_index AS A, demo_index AS B WHERE A.maxX>=B.minX AND A.minX<=B.maxX AND A.maxY>=B.minY AND A.minY<=B.maxY AND B.id=28269 ORDER BY 1
28215 28216 28262 28269

SQL> quit;
quit
result: null
 elapsed time: 33.303383112s
```


## Support

Please, [file an issue](https://github.com/fluencelabs/marine/issues) if you find a bug. You can also contact us at [Discord](https://discord.com/invite/5qSnPZKh7u) or [Telegram](https://t.me/fluence_project).  We will do our best to resolve the issue ASAP.


## Contributing

Any interested person is welcome to contribute to the project. Please, make sure you read and follow some basic [rules](https://github.com/fluencelabs/rust-peer/blob/master/CONTRIBUTING.md).


## License

All software code is copyright (c) Fluence Labs, Inc. under the [Apache-2.0](https://github.com/fluencelabs/rust-peer/blob/master/LICENSE) license.