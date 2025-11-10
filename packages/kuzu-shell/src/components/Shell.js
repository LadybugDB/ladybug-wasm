import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import lbug_wasm from '@lbug/lbug-wasm';



const Shell = () => {
  let UI_debug = false;
  const terminalRef = useRef(null);
  const [term, setTerm] = useState(null);
  const [connection, setConnection] = useState(null);
  const fileInputRef = useRef();

  const handleFileSelect = event => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        var fileData = new Uint8Array(e.target.result); // transfer to Uint8Array
        var fileName = file.name; // get path from user
        var filePath = 'data/' + fileName;
        lbug.FS.writeFile(filePath, fileData);
        console.log('File uploaded successfully!');
      };
      reader.readAsArrayBuffer(file);
    }
  }

  const keywordList = ["CALL", "CREATE", "DELETE", "DETACH", "EXISTS", "FOREACH", "LOAD", "MATCH", "MERGE", "OPTIONAL", "REMOVE", "RETURN", "SET", "START", "UNION", "UNWIND", "WITH", "LIMIT", "ORDER", "SKIP", "WHERE", "YIELD", "ASC", "ASCENDING", "ASSERT", "BY", "CSV", "DESC", "DESCENDING", "ON", "ALL", "CASE", "ELSE", "END", "THEN", "WHEN", "AND", "AS", "REL", "TABLE", "CONTAINS", "DISTINCT", "ENDS", "IN", "IS", "NOT", "OR", "STARTS", "XOR", "CONSTRAINT", "DROP", "EXISTS", "INDEX", "NODE", "KEY", "UNIQUE", "INDEX", "JOIN", "PERIODIC", "COMMIT", "SCAN", "USING", "FALSE", "NULL", "TRUE", "ADD", "DO", "FOR", "MANDATORY", "OF", "REQUIRE", "SCALAR", "EXPLAIN", "PROFILE", "HEADERS", "FROM", "FIELDTERMINATOR", "STAR", "MINUS", "COUNT", "PRIMARY", "COPY", "RDFGRAPH", "ALTER", "RENAME", "COMMENT", "MACRO", "GLOB", "COLUMN", "GROUP", "DEFAULT", "TO", "BEGIN", "TRANSACTION", "READ", "ONLY", "WRITE", "COMMIT_SKIP_CHECKPOINT", "ROLLBACK", "ROLLBACK_SKIP_CHECKPOINT", "INSTALL", "EXTENSION", "SHORTEST", "ATTACH", "IMPORT", "EXPORT", "USE"]
  const startHint = (lbugTerm,dbVersion,storageVersion) => {
    lbugTerm.writeln('Welcome to the Ladybug Shell!');
    lbugTerm.writeln('Database: v'+dbVersion);
    lbugTerm.writeln('Storage : v'+storageVersion);
    lbugTerm.writeln('Package : @lbug/lbug-wasm');
    lbugTerm.writeln('\n\rConnected to a local transient in-memory database.');
    lbugTerm.writeln('Enter help for usage hints.\n\r');
  }

  const helpHint = (lbugTerm) => {
    // lbugTerm.write("\n\n\r")
    lbugTerm.writeln('');
    lbugTerm.writeln('');
    lbugTerm.writeln('\x1b[1;33mCommands:\x1b[0m');
    lbugTerm.writeln('clear                 Clear the shell.');
    lbugTerm.writeln('ls                    List files in the data directory.');
    lbugTerm.writeln('upload                Upload a file to the data directory.');
    lbugTerm.writeln('examples              Example queries.');
    lbugTerm.writeln('');
    lbugTerm.writeln('Repositories:');
    lbugTerm.writeln('\thttps://github.com/unswdb/lbug-wasm');
  }

  const examplesHint = (lbugTerm) => {

    lbugTerm.write("\n\n\r")
    lbugTerm.writeln('\x1b[1;33mExample queries:\x1b[0m');
    lbugTerm.write("\n\r")
    lbugTerm.writeln('# Create schema');
    lbugTerm.writeln('CREATE NODE TABLE User(name STRING, age INT64, PRIMARY KEY (name))');
    lbugTerm.writeln('CREATE NODE TABLE City(name STRING, population INT64, PRIMARY KEY (name))');
    lbugTerm.writeln('CREATE REL TABLE Follows(FROM User TO User, since INT64)');
    lbugTerm.writeln('CREATE REL TABLE LivesIn(FROM User TO City)');
    lbugTerm.writeln('');
    lbugTerm.writeln('#Insert data');
    lbugTerm.writeln('COPY User FROM "/demo-db/csv/user.csv"');
    lbugTerm.writeln('COPY City FROM "/demo-db/csv/city.csv"');
    lbugTerm.writeln('COPY Follows FROM "/demo-db/csv/follows.csv"');
    lbugTerm.writeln('COPY LivesIn FROM "/demo-db/csv/lives-in.csv"');
    lbugTerm.writeln('');
    lbugTerm.writeln('#Cypher query');
    lbugTerm.writeln('MATCH (a:User)-[f:Follows]->(b:User)RETURN a.name, b.name, f.since');
  }

  const formatString = (inputString) => {
    // return inputString
    keywordList.forEach(keyword => {
      const color = "\x1b[1;36m"
      const pattern = new RegExp(`\\b${keyword}\\b`, "gi");
      inputString = inputString.replace(pattern, `${color}$&\x1b[0m`);
    });
    return inputString;
  }

  useEffect(() => {
    if (terminalRef.current && !term) {
      const lbugTerm = new Terminal({
        cursorBlink: true,
        cursorStyle: 'block',
        fontSize: 14,
        fontFamily: 'monospace',
        theme: { background: '#333' },
      });
      const PROMPT = "lbug# ";
      lbugTerm.prompt = () => {
        lbugTerm.write("\r\n" + PROMPT);
      };
      const fitAddon = new FitAddon();
      lbugTerm.loadAddon(fitAddon);
      lbugTerm.open(terminalRef.current);
      fitAddon.fit();

      setTerm(lbugTerm);
      lbugTerm.writeln('Starting lbug...');
      var lbug = null;
      let database = null;
      let connection = null;
      if (!UI_debug) {
        lbug_wasm().then((module) => {
          lbug = module;
          window.lbug = lbug
          lbug.FS.mkdir("data")
          database = new module.WebDatabase("test", 0, 1, false, false, 4194304 * 16 * 4)
          connection = new module.WebConnection(database, 0)
          lbugTerm.clear();
          const storageVersion = lbug.WebDatabase.getStorageVersion();
          const dbVersion = lbug.WebDatabase.getVersion();
          startHint(lbugTerm,dbVersion,storageVersion);
          lbugTerm.prompt();
        })
      } else { lbugTerm.clear(); lbugTerm.writeln('Welcome to the Ladybug Shell!'); }

      const getCurrentLineContent = (cursorY = lbugTerm.buffer.active.cursorY + lbugTerm.buffer.active.viewportY) => {
        if (cursorY < 1) return PROMPT;
        let command = lbugTerm.buffer.active.getLine(cursorY).translateToString().trim();
        // console.log("cursorY",cursorY,"command","'"+command+"'")
        command = command.startsWith(PROMPT.trim())
          ? command.slice(PROMPT.length)
          : getCurrentLineContent(cursorY - 1) + ';' + command;
        return command;
      };

      lbugTerm.attachCustomKeyEventHandler((arg) => {
        if ((arg.ctrlKey || arg.metaKey) && arg.code === "KeyV" && arg.type === "keydown") {
          if (UI_debug) console.log(arg)
          navigator.clipboard.readText()
            .then(text => {
              text = formatString(text);
              lbugTerm.write(text.replace(/\r?\n/g, '\r\n'));
            })
        } else if (arg.ctrlKey && arg.code === "KeyC" && arg.type === "keydown") {
          lbugTerm.prompt();
        }
        return true;
      });
      const executeCommand = (commands) => {
        // console.log(commands.split(';'))
        // return
        try {
          let commandList = commands.split(';');
          commandList.forEach((cmd) => {
            cmd = cmd.trim();
            // console.log("exec:",cmd);
            if (cmd != '') {
              if (cmd.startsWith('#') || cmd.startsWith('//')) return;
              let result = connection.query(cmd);
              let text = result.printExecutionResult().replace(/\r?\n/g, '\r\n')
              // console.log(`${result.toString()}`)
              lbugTerm.writeln(`\r\n${text}`);
            }
          });
          // var result = connection.query(currentLineContent);
          // let text = result.printExecutionResult().replace(/\r?\n/g, '\r\n')
          // console.log(`${result.toString()}`)
          // lbugTerm.writeln(`\r\n${text}`);
        } catch (error) {
          lbugTerm.writeln(`\r\nError: ${error.message}`);
        }
      }
      lbugTerm.onKey(({ key, domEvent }) => {
        const printable = !domEvent.altKey && !domEvent.altGraphKey && !domEvent.ctrlKey && !domEvent.metaKey;
        // console.log(domEvent.key)
        if (domEvent.key === 'Enter') {
          const inputString = lbugTerm.buffer.active.getLine(0)?.translateToString().trim();
          //get current line
          const currentLineContent = getCurrentLineContent();
          if (currentLineContent == "ls") {
            let file_list = window.lbug.FS.readdir('data').filter(e => e !== '.' && e !== '..')
            //print file list
            if (file_list.length != 0) lbugTerm.write('\r\n' + file_list.join(' '))
            // console.log(file_list)
          } else if (currentLineContent == "upload") {
            fileInputRef.current.click();
          }
          else if (currentLineContent == "clear") {
            // lbugTerm.writeln("\r\n")
            lbugTerm.clear();
          }
          else if (currentLineContent == "help") {
            helpHint(lbugTerm);
          }
          else if (currentLineContent == "examples") {
            examplesHint(lbugTerm);
          }
          else if (!UI_debug && inputString && connection) {
            executeCommand(currentLineContent)
          }
          else {
            lbugTerm.write('\r\nUI debug mode'); console.log(UI_debug, inputString, connection)
          }
          lbugTerm.prompt();
        } else if (domEvent.key == 'Backspace') {
          if (lbugTerm.buffer.active.cursorX > PROMPT.length) {
            lbugTerm.write('\b \b');
          }
        }else if (domEvent.key === "ArrowUp" ){;}
        else if (domEvent.key === "ArrowDown" ){;}
        else if (domEvent.key === "ArrowLeft" || domEvent.key === "ArrowRight" ){lbugTerm.write(key);}
        else if (printable) {
          //common chacater
          lbugTerm.write(key);
          // console.log("write", key)
          let cur_line = getCurrentLineContent();
          if (key.trim() == "") return;
          // console.log("after insert",cur_line)
          let word = cur_line.split(" ").pop()
          // console.log(word)
          // console.log(cur_line.split(" "))
          // repaint the last word
          for (let i = 0; i < word.length; i++) {
            lbugTerm.write('\b \b');
          }
          if (keywordList.includes(word.toUpperCase())){
            // use green color to print
            lbugTerm.write('\x1b[1;36m')
            //add the keyword
            lbugTerm.write(word);
            //reset the color
            lbugTerm.write('\x1b[0m')
          }else{
            lbugTerm.write('\x1b[0m')
            lbugTerm.write(word);
            // console.log(word)
          }

        }
      });
    }
  }, [term, connection]);

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
      <div ref={terminalRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default Shell;


