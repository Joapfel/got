# Got, a simple tool for generating golang unit tests

Got creates a `_test.go` for the currently open `.go` file.
This new file will include unit test stubs following the convention `func Test<OriginalFunctionOrMethodName>(t *testing.T){}`.
Optionally, it generates the data structure for table driven tests following the convention `type <originalFunctionOrMethodName>Tests struct {}`.


## Commands
`got: create unit tests (simple)` creates test functions
`got: create unit tests (table driven)` creates test functions and the skeleton for table driven tests
