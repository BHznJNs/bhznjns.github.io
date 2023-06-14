# Rust 命令行交互语法高亮实现 (1)

``2023/6/14``

本文主要介绍笔者对于 [Calculator.rs](https://github.com/BHznJNs/Calculator.rs) 中``repl``下##语法高亮##的实现方式。

- - -

## 实现前提：``raw_mode``的启用

通常来说，我们在使用 rust 时，要想获取用户输入，就必须调用 rust 标准库中的``io\:\:stdin().readline``函数。

```rust
use std::io::{self, Write};

fn main() {
    let mut input = String::new();
    io::stdin()
        .read_line(&mut input)
        .unwrap();
    
    println!("{}", input);
}
```

但是，通过这种方式来获取用户输入有一个缺点：你只能在用户输入完一行，按下回车后才能拿到用户输入的内容，而在用户输入的过程中，你啥也干不了。

那么，有没有办法能够逐个字符地读取用户输入，并做出自定义的反馈呢？当然有。那就是``raw_mode``。

这个``raw_mode``并不是一个对于命令行的专有名词，只是在 [crossterm](https://github.com/crossterm-rs/crossterm) 等库中对于这种需求实现的称呼。

本文的实现同样是围绕 crossterm 这个库而展开，原因很简单，这个库集成了我们要实现语法高亮的太多功能：光标控制、raw_mode、终端信息获取、输出上色等等，且其中的一些功能在不同的操作系统上需要有不同的实现，使用这个跨平台且在多款终端上经过测试的库比起自己实现要舒服得多。

相比于常规的 Readline，在``raw_mode``下，用户的输入不会有任何的默认行为，包括但不限于显示输入字符、回车换行返回、退格删除字符、光标移动等。

- - -

## 语法高亮实现思路

实现思路非常简单易懂，可以简单地分为三个阶段：

1. 读取用户输入并存储到字符串
2. 对这个字符串进行分析 (tokenize)
3. 使用分析的结果 (tokens) 进行渲染

接下来，我会，逐一介绍这三个阶段。

### 读取用户输入并存储

在``raw_mode``读取用户输入时，我们需要先对 crossterm 封装好的键盘事件进行处理，这段代码可以用来获取当前的按键事件。

```rust
use crossterm::{
    event::{self, Event, KeyEvent, KeyEventKind},
};

pub fn get_key() -> Option<KeyEvent> {
    if let Ok(Event::Key(key)) = event::read() {
        // 对按键事件进行判断是为了防止一次按键的点击触发多次事件
        // 所以对其限制为只有按键被按下时返回 Some 值。
        if key.kind == KeyEventKind::Press {
            return Some(key);
        }
    }
    None
}
```

然后，我们需要利用这个函数来获取按键事件并进行处理。

```rust
use crossterm::terminal::{enable_raw_mode, disable_raw_mode};

enable_raw_mode().unwrap();
loop {
    let Some(key) = get_key() else {
        // 跳过不需要的按键事件
        continue;
    };

    // 当遇到 ctrl + c 时，中断按键事件读取
    if key.modifiers == KeyModifiers::CONTROL && key.code == KeyCode::Char('c') {
        break;
    }

    // 用来存储当前行内容的字符串
    let mut line_content = String::new();

    match key.code {
        KeyCode::Left => todo!(),
        KeyCode::Right => todo!(),

        KeyCode::Enter => todo!(),
        KeyCode::Tab => todo!(),
        KeyCode::Backspace => todo!(),

        KeyCode::Char(ch) => {
            if !ch.is_ascii() {
                // 当遇到非 ASCII 字符时，中断
                break
            }

            // 这里只考虑在单行内对行尾进行 push 操作的情况，
            // 对行中操作以及当前行过长的情况暂不考虑。
            line_content.push(ch);
            print!("{}", ch);
        }

        // 跳过不需要考虑的按键
        _ => {}
    }
}
disable_raw_mode().unwrap();
```

### 对读取到的字符串进行解析

这一阶段简单来说就是对上一阶段获得的字符串进行 tokenize，但是这与编译代码时所使用的分词器有所不同：这个 tokenizer 所生成的 token 必须能够被用来较容易地还原出原始内容。

这一阶段的代码因人而异，这里仅贴出 Calculator.rs 项目中使用的 tokenizer 代码，谨供参考：

```rust
pub fn tokenize(source: &str) -> TokenVec {
    let mut index = 0;

    // is used for check is number minus OR
    // check is in annotation state.
    let mut last_type = TokenType::Unknown;

    // use to control if number is minus
    let mut is_num_minus = false;

    let mut tokens = TokenVec::new();
    let mut comment = String::new();
    let chars = source.as_bytes();
    let source_len = source.len();

    while index < source_len {
        let mut current = chars[index];

        if last_type == TokenType::Comment {
            comment.push(current as char);
            index += 1;
            continue;
        }

        // Number
        if current.is_ascii_digit() {
            last_type = TokenType::Number;

            let mut value = String::from(current as char);

            index += 1;
            current = chars[index];

            while index < source_len {
                if current.is_ascii_digit() && current == POINT_ASCII {
                    value.push(current as char);
                    index += 1;
                    current = chars[index];
                    continue;
                }
                break;
            }

            if is_num_minus {
                is_num_minus = false;
                value.insert(0, '-');
            }

            let current_token = Token::new(TextType::NumberLiteral, value);
            tokens.push_back(current_token);
            continue;
        }

        // Identifier
        if is_identi_ascii(current) {
            let mut value = String::from(current as char);

            index += 1;
            current = chars[index];
            while is_identi_ascii(current) || current.is_ascii_digit() {
                value.push(current as char);
                index += 1;
                current = chars[index];
            }

            if last_type == TokenType::Annotation {
                // Type annotation
                tokens.push_back(Token::new(TextType::Annotation, value));
            } else {
                let option_keyword = is_keyword(&value);

                let is_keyword = option_keyword || value.eq("true") || value.eq("false");

                if is_keyword {
                    last_type = TokenType::Keyword;
                    tokens.push_back(Token::new(TextType::Keyword, value));
                } else {
                    last_type = TokenType::Identifier;
                    tokens.push_back(Token::new(TextType::Variable, value));
                }
            }
            continue;
        }

        // --- --- --- --- --- ---

        match current {
            // Parenthesis
            LEFT_PAREN_ASCII 
            | RIGHT_PAREN_ASCII 
            | LEFT_BRACKET_ASCII 
            | RIGHT_BRACKET_ASCII
            | LEFT_BRACE_ASCII 
            | RIGHT_BRACE_ASCII => {
                last_type = TokenType::Paren;
                tokens.push_back(Token::new(TextType::Didider, String::from(current as char)));
            }

            // Computing symbols
            PLUS_ASCII
            | MINUS_ASCII 
            | MULTIPLY_ASCII 
            | DIVIDE_ASCII 
            | POWER_ASCII
            | NOT_SYMBOL_ASCII 
            | LESS_THAN_ASCII 
            | MORE_THAN_ASCII 
            | EQUAL_ASCII 
            | POINT_ASCII => {
                last_type = TokenType::Symbol;
                tokens.push_back(Token::new(TextType::Didider, String::from(current as char)));
            }

            // String literal
            SINGLE_QUOTE_ASCII | DOUBLE_QUOTE_ASCII => {
                // String token resolve
                let mut value = String::from(current as char);
                let mut is_escape_char = false;
                index += 1;

                while index < source_len {
                    current = chars[index];

                    if !is_escape_char
                        && (current == SINGLE_QUOTE_ASCII || current == DOUBLE_QUOTE_ASCII)
                    {
                        value.push(current as char);
                        break;
                    }

                    // switch escape character state
                    if is_escape_char {
                        is_escape_char = false;
                    } else if current == BACKSLASH_ASCII {
                        is_escape_char = true;
                    }

                    value.push(current as char);
                    index += 1;
                }

                index += 1;
                last_type = TokenType::String;
                tokens.push_back(Token::new(TextType::StringLiteral, value));
                continue;
            }

            // Other symbols
            BACKSLASH_ASCII | COMMA_ASCII | SEMICOLON_ASCII => {
                last_type = TokenType::Divider;
                tokens.push_back(Token::new(TextType::Didider, String::from(current as char)));
            }

            DOLLAR_ASCII => {
                // type annotation
                last_type = TokenType::Annotation;
                tokens.push_back(Token::new(TextType::Annotation, String::from('$')))
            }

            SPACE_ASCII => tokens.push_back(Token::new(TextType::Didider, String::from(' '))),

            // comment symbol: # (Number Sign)
            NUMBER_SIGN_ASCII => {
                last_type = TokenType::Comment;
                comment.push('#');
            }

            NULL_ASCII => break,
            _ => {}
        }

        index += 1;
    }

    if !comment.is_empty() {
        tokens.push_back(Token::new(TextType::Comment, comment));
    }
    return tokens;
}
```

还有其中的一些定义：

```rust
// ASCII_constants.rs
pub fn is_identi_ascii(ascii: u8) -> bool {
    // a-z A-Z _
    const UNDERLINE_ASCII: u8 = 95;
    return ascii.is_ascii_alphabetic() || ascii == UNDERLINE_ASCII;
}

pub fn is_keyword(word: &str) -> bool {
    const KEYWORD_PAIRS: [&'static str; 9] = [
        "out",
        "for",
        "if",
        "ctn",
        "brk",
        "import",
        "fn",
        "cl",
        "new",
    ];

    for k in KEYWORD_PAIRS {
        if word.eq(k) {
            return true;
        }
    }
    return false;
}

pub const POINT_ASCII: u8 = 46;

pub const LEFT_PAREN_ASCII: u8 = 40; // (
pub const RIGHT_PAREN_ASCII: u8 = 41; // )
pub const LEFT_BRACKET_ASCII: u8 = 91; // [
pub const RIGHT_BRACKET_ASCII: u8 = 93; // ]
pub const LEFT_BRACE_ASCII: u8 = 123; // {
pub const RIGHT_BRACE_ASCII: u8 = 125; // }

pub const PLUS_ASCII: u8 = 43; // +
pub const MINUS_ASCII: u8 = 45; // -
pub const MULTIPLY_ASCII: u8 = 42; // *
pub const DIVIDE_ASCII: u8 = 47; // /
pub const POWER_ASCII: u8 = 94; // ^

pub const NOT_SYMBOL_ASCII: u8 = 33; // !
pub const LESS_THAN_ASCII: u8 = 60; // <
pub const MORE_THAN_ASCII: u8 = 62; // >
pub const EQUAL_ASCII: u8 = 61; // =

pub const SINGLE_QUOTE_ASCII: u8 = 39; // '''
pub const DOUBLE_QUOTE_ASCII: u8 = 34; // '"'
pub const BACKSLASH_ASCII: u8 = 92; // '\'

pub const SEMICOLON_ASCII: u8 = 59; // ;
pub const COMMA_ASCII: u8 = 44; // ,
pub const DOLLAR_ASCII: u8 = 36; // $
pub const NUMBER_SIGN_ASCII: u8 = 35; // #
pub const SPACE_ASCII: u8 = 32; // ' '
pub const TAB_ASCII: u8 = 9; // '\t'

pub const NULL_ASCII: u8 = 0; // '\0'

// token.rs
use std::{collections::VecDeque, ops::Range};

use crossterm::style::{Stylize, StyledContent};

#[derive(PartialEq, Debug, Clone, Copy)]
pub enum TokenType {
    Unknown,

    Number,
    String,
    Symbol,
    Paren,
    Identifier,
    Keyword,

    Divider,
    Annotation,
    Comment,
}

#[derive(PartialEq, Debug, Clone, Copy)]
pub enum TextType {
    Hint,

    Variable,
    Keyword,
    Annotation,

    Didider,
    Comment,

    NumberLiteral,
    StringLiteral,
}

#[derive(PartialEq, Debug)]
pub struct Token {
    pub type__: TextType,
    pub content: String,
}

pub type TokenVec = VecDeque<Token>;

impl Token {
    pub fn new(type__: TextType, content: String) -> Self {
        Token { type__, content }
    }
    pub fn len(&self) -> usize {
        self.content.len()
    }

    pub fn colored(&self) -> StyledContent<&str> {
        let text = self.content.as_str();

        match self.type__ {
            TextType::Hint => text.dim(),

            TextType::Variable => text.underlined(),
            TextType::Keyword => text.dark_cyan(),
            TextType::Annotation => text.red(),

            TextType::Didider => text.white(),
            TextType::Comment => text.green().dim(),

            TextType::NumberLiteral => text.yellow(),
            TextType::StringLiteral => text.dark_yellow(),
        }
    }
}
```

通过这一步骤，可以生成形如下面这样的 token：

```rust
Token { type__: TextType::Identifier    , content: "variable" }
Token { type__: TextType::Divider       , content: " " }
Token { type__: TextType::Symbol        , content: "=" }
Token { type__: TextType::Divider       , content: " " }
Token { type__: TextType::StringLiteral , content: "\"foo bar\"" }
```

### 使用分析的结果进行渲染

这一步就很简单了，直接循环第二步所产生的 token，然后通过``token.colored``获取 token 对应的``StyledContent``，直接 print 出来即可。

```rust
use crossterm::{cursor, execute};

fn clear_line() -> io::Result<()> {
    // 把光标移动到终端最左侧
    execute!(stdout(), cursor::MoveToColumn(0))?;
    // 清除光标后的字符
    const BACKSPACE: &'static str = "\x1B[K";
    print!("{}", BACKSPACE);

    Ok(())
}

pub fn render(tokens: TokenVec) -> io::Result<()> {
    let mut stdout = stdout();
    // 隐藏光标
    execute!(stdout, cursor::Hide)?;
    clear_line()?;

    for token in tokens {
        print!("{}", token.colored());
    }
    // 显示光标
    execute!(stdout, cursor::Show)?;

    stdout.flush()
}
```

在第一阶段的``loop``中调用：

```rust
...
KeyCode::Char(ch) => {
    if !ch.is_ascii() {
        // 当遇到非 ASCII 字符时，中断
        break
    }

    // 这里只考虑在单行内对行尾进行 push 操作的情况，
    // 对行中操作以及当前行过长的情况暂不考虑。
    line_content.push(ch);

    line_content.push('\0'); // '\0' 作为行终止符
    let tokens = tokenize(&line_content);
    line_content.pop(); // 移除 '\0'

    render(tokens).unwrap();
}
...
```

- - -

最终实现效果如下：

![效果图](.语法高亮实现\(1\)/test-screenshot.png)

- - -

## 完整代码如下

```rust
extern crate crossterm;

use std::io::{self, stdout, Write};
use std::collections::VecDeque;

use crossterm::event::{KeyModifiers, KeyCode};
use crossterm::terminal::{enable_raw_mode, disable_raw_mode};
use crossterm::{execute, cursor};
use crossterm::event::{self, Event, KeyEvent, KeyEventKind};
use crossterm::style::{Stylize, StyledContent};

const POINT_ASCII: u8 = 46;
const LEFT_PAREN_ASCII: u8 = 40; // (
const RIGHT_PAREN_ASCII: u8 = 41; // )
const LEFT_BRACKET_ASCII: u8 = 91; // [
const RIGHT_BRACKET_ASCII: u8 = 93; // ]
const LEFT_BRACE_ASCII: u8 = 123; // {
const RIGHT_BRACE_ASCII: u8 = 125; // }
const PLUS_ASCII: u8 = 43; // +
const MINUS_ASCII: u8 = 45; // -
const MULTIPLY_ASCII: u8 = 42; // *
const DIVIDE_ASCII: u8 = 47; // /
const POWER_ASCII: u8 = 94; // ^
const NOT_SYMBOL_ASCII: u8 = 33; // !
const LESS_THAN_ASCII: u8 = 60; // <
const MORE_THAN_ASCII: u8 = 62; // >
const EQUAL_ASCII: u8 = 61; // =
const SINGLE_QUOTE_ASCII: u8 = 39; // '''
const DOUBLE_QUOTE_ASCII: u8 = 34; // '"'
const BACKSLASH_ASCII: u8 = 92; // '\'
const SEMICOLON_ASCII: u8 = 59; // ;
const COMMA_ASCII: u8 = 44; // ,
const DOLLAR_ASCII: u8 = 36; // $
const NUMBER_SIGN_ASCII: u8 = 35; // #
const SPACE_ASCII: u8 = 32; // ' '
const TAB_ASCII: u8 = 9; // '\t'
const NULL_ASCII: u8 = 0; // '\0'

pub fn get_key() -> Option<KeyEvent> {
    if let Ok(Event::Key(key)) = event::read() {
        // 对按键事件进行判断是为了防止一次按键的点击触发多次事件
        // 所以对其限制为只有按键被按下时返回 Some 值。
        if key.kind == KeyEventKind::Press {
            return Some(key);
        }
    }
    None
}

#[derive(PartialEq, Debug, Clone, Copy)]
pub enum TokenType {
    Unknown,

    Number,
    String,
    Symbol,
    Paren,
    Identifier,
    Keyword,

    Divider,
    Annotation,
    Comment,
}

#[derive(PartialEq, Debug, Clone, Copy)]
pub enum TextType {
    Hint,

    Variable,
    Keyword,
    Annotation,

    Didider,
    Comment,

    NumberLiteral,
    StringLiteral,
}

#[derive(PartialEq, Debug)]
pub struct Token {
    pub type__: TextType,
    pub content: String,
}

pub type TokenVec = VecDeque<Token>;

impl Token {
    pub fn new(type__: TextType, content: String) -> Self {
        Token { type__, content }
    }
    pub fn len(&self) -> usize {
        self.content.len()
    }

    pub fn colored(&self) -> StyledContent<&str> {
        let text = self.content.as_str();

        match self.type__ {
            TextType::Hint => text.dim(),

            TextType::Variable => text.underlined(),
            TextType::Keyword => text.dark_cyan(),
            TextType::Annotation => text.red(),

            TextType::Didider => text.white(),
            TextType::Comment => text.green().dim(),

            TextType::NumberLiteral => text.yellow(),
            TextType::StringLiteral => text.dark_yellow(),
        }
    }
}

pub fn tokenize(source: &str) -> TokenVec {
    // a-z A-Z _
    pub fn is_identi_ascii(ascii: u8) -> bool {
        const UNDERLINE_ASCII: u8 = 95;
        return ascii.is_ascii_alphabetic() || ascii == UNDERLINE_ASCII;
    }
    pub fn is_keyword(word: &str) -> bool {
        const KEYWORD_PAIRS: [&'static str; 9] = [
            "out",
            "for",
            "if",
            "ctn",
            "brk",
            "import",
            "fn",
            "cl",
            "new",
        ];

        for k in KEYWORD_PAIRS {
            if word.eq(k) {
                return true;
            }
        }
        return false;
    }

    let mut index = 0;

    // is used for check is number minus OR
    // check is in annotation state.
    let mut last_type = TokenType::Unknown;

    // use to control if number is minus
    let mut is_num_minus = false;

    let mut tokens = TokenVec::new();
    let mut comment = String::new();
    let chars = source.as_bytes();
    let source_len = source.len();

    while index < source_len {
        let mut current = chars[index];

        if last_type == TokenType::Comment {
            comment.push(current as char);
            index += 1;
            continue;
        }

        // Number
        if current.is_ascii_digit() {
            last_type = TokenType::Number;

            let mut value = String::from(current as char);

            index += 1;
            current = chars[index];

            while index < source_len {
                if current.is_ascii_digit() && current == POINT_ASCII {
                    value.push(current as char);
                    index += 1;
                    current = chars[index];
                    continue;
                }
                break;
            }

            if is_num_minus {
                is_num_minus = false;
                value.insert(0, '-');
            }

            let current_token = Token::new(TextType::NumberLiteral, value);
            tokens.push_back(current_token);
            continue;
        }

        // Identifier
        if is_identi_ascii(current) {
            let mut value = String::from(current as char);

            index += 1;
            current = chars[index];
            while is_identi_ascii(current) || current.is_ascii_digit() {
                value.push(current as char);
                index += 1;
                current = chars[index];
            }

            if last_type == TokenType::Annotation {
                // Type annotation
                tokens.push_back(Token::new(TextType::Annotation, value));
            } else {
                let option_keyword = is_keyword(&value);

                let is_keyword = option_keyword || value.eq("true") || value.eq("false");

                if is_keyword {
                    last_type = TokenType::Keyword;
                    tokens.push_back(Token::new(TextType::Keyword, value));
                } else {
                    last_type = TokenType::Identifier;
                    tokens.push_back(Token::new(TextType::Variable, value));
                }
            }
            continue;
        }

        // --- --- --- --- --- ---

        match current {
            // Parenthesis
            LEFT_PAREN_ASCII 
            | RIGHT_PAREN_ASCII 
            | LEFT_BRACKET_ASCII 
            | RIGHT_BRACKET_ASCII
            | LEFT_BRACE_ASCII 
            | RIGHT_BRACE_ASCII => {
                last_type = TokenType::Paren;
                tokens.push_back(Token::new(TextType::Didider, String::from(current as char)));
            }

            // Computing symbols
            PLUS_ASCII
            | MINUS_ASCII 
            | MULTIPLY_ASCII 
            | DIVIDE_ASCII 
            | POWER_ASCII
            | NOT_SYMBOL_ASCII 
            | LESS_THAN_ASCII 
            | MORE_THAN_ASCII 
            | EQUAL_ASCII 
            | POINT_ASCII => {
                last_type = TokenType::Symbol;
                tokens.push_back(Token::new(TextType::Didider, String::from(current as char)));
            }

            // String literal
            SINGLE_QUOTE_ASCII | DOUBLE_QUOTE_ASCII => {
                // String token resolve
                let mut value = String::from(current as char);
                let mut is_escape_char = false;
                index += 1;

                while index < source_len {
                    current = chars[index];

                    if !is_escape_char
                        && (current == SINGLE_QUOTE_ASCII || current == DOUBLE_QUOTE_ASCII)
                    {
                        value.push(current as char);
                        break;
                    }

                    // switch escape character state
                    if is_escape_char {
                        is_escape_char = false;
                    } else if current == BACKSLASH_ASCII {
                        is_escape_char = true;
                    }

                    value.push(current as char);
                    index += 1;
                }

                index += 1;
                last_type = TokenType::String;
                tokens.push_back(Token::new(TextType::StringLiteral, value));
                continue;
            }

            // Other symbols
            BACKSLASH_ASCII | COMMA_ASCII | SEMICOLON_ASCII => {
                last_type = TokenType::Divider;
                tokens.push_back(Token::new(TextType::Didider, String::from(current as char)));
            }

            DOLLAR_ASCII => {
                // type annotation
                last_type = TokenType::Annotation;
                tokens.push_back(Token::new(TextType::Annotation, String::from('$')))
            }

            SPACE_ASCII => tokens.push_back(Token::new(TextType::Didider, String::from(' '))),

            // comment symbol: # (Number Sign)
            NUMBER_SIGN_ASCII => {
                last_type = TokenType::Comment;
                comment.push('#');
            }

            NULL_ASCII => break,
            _ => {}
        }

        index += 1;
    }

    if !comment.is_empty() {
        tokens.push_back(Token::new(TextType::Comment, comment));
    }
    return tokens;
}

fn main() {
    fn clear_line() -> io::Result<()> {
        // 把光标移动到终端最左侧
        execute!(stdout(), cursor::MoveToColumn(0))?;
        // 清除光标后的字符
        const BACKSPACE: &'static str = "\x1B[K";
        print!("{}", BACKSPACE);

        Ok(())
    }

    pub fn render(tokens: TokenVec) -> io::Result<()> {
        let mut stdout = stdout();
        // 隐藏光标
        execute!(stdout, cursor::Hide)?;
        clear_line()?;

        for token in tokens {
            print!("{}", token.colored());
        }
        // 显示光标
        execute!(stdout, cursor::Show)?;

        stdout.flush()
    }

    // 用来存储当前行内容的字符串
    let mut line_content = String::new();

    enable_raw_mode().unwrap();
    loop {
        let Some(key) = get_key() else {
            // 跳过不需要的按键事件
            continue;
        };
    
        // 当遇到 ctrl + c 时，中断按键事件读取
        if key.modifiers == KeyModifiers::CONTROL && key.code == KeyCode::Char('c') {
            break;
        }
    
        match key.code {
            KeyCode::Left => todo!(),
            KeyCode::Right => todo!(),
    
            KeyCode::Enter => todo!(),
            KeyCode::Tab => todo!(),
            KeyCode::Backspace => todo!(),
    
            KeyCode::Char(ch) => {
                if !ch.is_ascii() {
                    // 当遇到非 ASCII 字符时，中断
                    break
                }

                // 这里只考虑在单行内对行尾进行 push 操作的情况，
                // 对行中操作以及当前行过长的情况暂不考虑。
                line_content.push(ch);

                line_content.push('\0'); // 以 '\0' 作为行终止符
                let tokens = tokenize(&line_content);
                line_content.pop(); // 移除 '\0'

                render(tokens).unwrap();
            }
    
            // 跳过不需要考虑的按键
            _ => {}
        }
    }
    disable_raw_mode().unwrap();
}
```
