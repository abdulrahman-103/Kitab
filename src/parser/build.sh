#nim c -d:release --opt:speed -o:src/parser/parser --verbosity:0 --hints:off src/parser/src/parser.nim
nim c --app:lib --out:src/kitab/parser.so src/parser/src/parser.nim