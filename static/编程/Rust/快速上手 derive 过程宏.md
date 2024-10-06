# 快速上手 derive 过程宏

参考资料：[Rust 语言圣经](https://course.rs/advance/macro.html#%E7%94%A8%E8%BF%87%E7%A8%8B%E5%AE%8F%E4%B8%BA%E5%B1%9E%E6%80%A7%E6%A0%87%E8%AE%B0%E7%94%9F%E6%88%90%E4%BB%A3%E7%A0%81)

- - -

## 创建子项目

由于{一个 proc-macro 项目只能导出过程宏}(A proc-macro crate can only export proc-macros)，如果你需要在项目中使用过程宏，你必须要在项目下创建子项目，将其作为 proc-macro crate。

```shell
# 项目根目录下，对于 derive 过程宏，项目名称通常以 ``_derive`` 结尾
cargo new [proc-macro-name]_derive --lib
```

在子项目中，启用 ``proc-macro``，安装相关依赖

```toml
syn = {version = "2.0.79", features = ["full"]}
# 由于 rust 自带的 quote 宏处于 unstable 阶段，使用第三方库代替
quote = "1.0.37"
```

## 实现

由于子项目只用于导出过程宏，设为 lib 包根。打开子项目 ``src`` 目录下的 ``lib.rs`` 文件。

我们先写下宏的大纲

```rust
#[proc_macro_derive(MacroName)]
pub fn any_function_name(input: TokenStream) -> TokenStream {
    todo!()
}
```

下面以一个用于自动实现 trait 的宏为例

```rust
#[proc_macro_derive(FieldNamesDerive)]
pub fn resolve_struct_field_names(input: TokenStream) -> TokenStream {
    todo!()
}
```

这个宏用于自动为结构体实现 FieldNamesTrait，这个 trait 应该返回结构体的所有字段名称，但由于 rust 运行时的限制，我们必须借助宏在编译时获取这些字段名称，将其打包入编译产物，再在运行时通过 trait 中的方法对外暴露这些字段名称。

```rust
pub trait FieldNamesTrait {
    fn fields() -> Vec<&'static str>;
}
```

实际上，你可以给 derive 过程宏和 trait 相同的名称，不过为了易于下文区分，我们继续。

rust 的宏非常灵活，你可以通过宏直接对源代码在编译时进行 AST 层面的操作。

### 获取字段列表

我们先使用 ``syn`` 库对输入的 TokenStream 进行解析，获取 AST

```rust
let ast = syn::parse::<syn::ItemStruct>(input).expect("failed to parse input");
```

对于一个结构体，其 AST 结构大致如下（来自 Rust 语言圣经）：

```rust
pub struct User<'a T> {
    pub name: &'a T,
}
```

```
// vis，可视范围            ident，标识符    generic，范型    fields: 结构体的字段
   pub           struct   User            <'a, T>         {

// vis   ident   type
   pub   name:   &'a T,

}
```

于是我们可以这样获取结构体字段名称列表：

```rust
fn field_ident_resolver(field: &syn::Field) -> &'static str {
    let field_string = field.ident.as_ref().unwrap().to_string();
    let leaked = Box::leak(field_string.into_boxed_str());
    return leaked;
}

let field_names = ast.fields
    .iter()
    .map(field_ident_resolver)
    .collect::<Vec<&'static str>>();
```

这里我们将所有字段通过 ``Box::leak`` 转化为 ``&'static str`` 类型的字符串，由于宏在编译时被处理，这样这些字段名称可以直接被打包进最终编译产物。

我们再编写产生“为结构体实现 trait”的代码，--挺起来有点绕口--

```rust
let struct_name = &ast.ident;
// 这里的 quote 宏可以通过其中的代码产生对应的 TokenStream
let output_impl = quote::quote! {
    impl ListedFieldNames for #type_name {
        fn fields() -> Vec<&'static str> {
            return vec![#(#field_names),*];
        }
    }
};
```

最终，我们将“为结构体实现 trait”的代码返回，这些代码会被附加到我们的结构体定义后，一同被编译

```rust
// 正常应该返回的类型为 ``proc_macro::TokenStream``，
// 但由于我们使用了第三方库，这里的 ``output_impl`` 实际类型虽然也叫 ``TokenStream``，
// 但和 ``proc_macro`` 中定义的不同，故需要调用其 ``into`` 方法将其转换为我们需要的类型。
return output_impl.into();
```
