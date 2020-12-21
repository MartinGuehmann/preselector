 cat ftp.neb.com/pub/rebase/allenz.txt | grep "<" | tr "\n" "\t" | sed -e "s/<1>/\n<1>/g" | grep -v "<7>	" | sed -e "s/<[1-9]>//g"
