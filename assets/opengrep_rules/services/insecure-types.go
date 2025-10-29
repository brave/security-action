// LICENSE: Commons Clause License Condition v1.0[LGPL-2.1-only]
// original source: https://github.com/returntocorp/semgrep-rules/blob/5b098c252feec688d243cef046d07597a546c25b/go/template/security/insecure-types.go

package main

import "fmt"
import "html/template"

func main() {
    var g = "foo"

    // ruleid:go-insecure-templates
    const a template.HTML = fmt.Sprintf("<a href=%q>link</a>")
    // ruleid:go-insecure-templates
    var b template.CSS = "a { text-decoration: underline; } "

    // ruleid:go-insecure-templates
    var c template.HTMLAttr =  fmt.Sprintf("herf=%q")

    // ruleid:go-insecure-templates
    const d template.JS = "{foo: 'bar'}"

    // ruleid:go-insecure-templates
    var e template.JSStr = "setTimeout('alert()')";

    // ruleid:go-insecure-templates
    var f template.Srcset = g;

    // ok:go-insecure-templates
    tmpl, err := template.New("test").ParseFiles("file.txt")

    // other code
    myTpl.Execute(w, a);
}
