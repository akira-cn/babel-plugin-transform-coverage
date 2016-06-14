# Babel Coverage Plugin

This is a plugin for babel to converts the source codes to the codes with coverage measurement.

Using [mocha](http://mochajs.org/) and [mocha-lcov-reporter](https://github.com/StevenLooman/mocha-lcov-reporter) as well to generate the LCOV report.

## Usage

#### install mocha & mocha-lcov-reporter

```bash
$ npm install --save-dev mocha
$ npm install --save-dev mocha-lcov-reporter
```

#### install babel-cli babel-plugin-transform-coverage

```bash
$ npm install --save-dev babel-cli
$ npm install --save-dev babel-plugin-transform-coverage
```

#### compile source code with babel

```bash
$ babel src/ --plugins transform-coverage --out-dir app/
```

#### gen report with mocha-lcov-reporter

```bash
$ mocha test --reporter=mocha-lcov-reporter > test-cov/coverage.lcov
```

## License

MIT