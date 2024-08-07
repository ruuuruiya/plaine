// Ref: https://github.dev/mckaywrigley/chatbot-ui/tree/main/components

'use client'

import { memo } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { coldarkDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'

export const programmingLanguages = {
    javascript: ".js",
    python: ".py",
    java: ".java",
    c: ".c",
    cpp: ".cpp",
    "c++": ".cpp",
    "c#": ".cs",
    ruby: ".rb",
    php: ".php",
    swift: ".swift",
    "objective-c": ".m",
    kotlin: ".kt",
    typescript: ".ts",
    go: ".go",
    perl: ".pl",
    rust: ".rs",
    scala: ".scala",
    haskell: ".hs",
    lua: ".lua",
    shell: ".sh",
    sql: ".sql",
    html: ".html",
    css: ".css"
};

export const generateRandomString = (length, lowercase = false) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXY3456789' // excluding similar looking characters like Z, 2, I, 1, O, 0
    let result = ''
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    };
    return lowercase ? result.toLowerCase() : result
}

const CodeBlock = memo(({ language, value }) => {

    return (
        <div className=" font-sans codeblock bg-zinc-950 my-5 rounded-md ">
            <div className="flex items-center justify-between w-full px-6 py-2 pr-4 bg-zinc-800 text-zinc-100 rounded-t-md">
                <span className="text-xs lowercase">{language}</span>
            </div>

            <SyntaxHighlighter
                language={language}
                style={coldarkDark}
                PreTag="div"
                showLineNumbers
                customStyle={{
                    margin: 0,
                    maxWidth: '100%',
                    background: 'transparent',
                    padding: '1.5rem 1rem',
                }}
                lineNumberStyle={{
                    userSelect: "none",
                }}
                codeTagProps={{
                    style: {
                        fontSize: '0.9rem',
                        fontFamily: 'monospace'
                    }
                }}
            >
                {value}
            </SyntaxHighlighter>
        </div>
    )
})
CodeBlock.displayName = 'CodeBlock'

export { CodeBlock }
