#!/bin/bash

inFile="link_gcg"
# Actually should be gcg.txt, but then I would have to change the html.
outFile="gcg.txt"

cat link_gcg | sed -e '/^ /,/\.\./d' \
                   -e '/^$/d' \
                   -e '/^.*?.*$/d' \
                   -e 's/\s\s*/\t/g' \
                   -e 's/;//g' \
             | cut -f 1,3 \
             | sed -e '1 s/^/database = \`/' \
                   -e '$ s/$/\`;/' > $outFile

                   # Removes first bit of the file until ..
                   # Removes empty line
                   # Removes lines with a question mark, those enzymes are without a known cut site
                   # Collapses consecutive spaces into one tab
                   # Removes semicolons
                   # Selects the first and third column
                   # Adds "database = `" in front
                   # Adds "`;" to the end
