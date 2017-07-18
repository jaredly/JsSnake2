#!/usr/bin/env python

print "Content-type:text/html\n"

class serr:
    def write(self,x):
        sys.stdout.write(x.replace("\n","<br>").replace(" ","&nbsp;"))
        

import sys
sys.stderr = serr()

import os

debug = False

import re

chs = 0

def listassn(match):
    global chs;chs+=1
    vars,value = match.group().split("=")
    if vars.startswith("var"):vars = vars[3:]
    vars = vars.strip("[] ").split(",")
    tog = ''.join(vars)
    ret = 'var ' + tog + ' = ' + value.strip(' ;') + '; ' + ';var '.join(['%s = %s[%d]'%(vars[i],tog,i) for i in range(len(vars))]) + ';'
    if debug: print match.group(),"<br>\t",ret,"<br>"
    return ret

def listcomp(match):
    global chs;chs+=1
    do,each,var,lst,cond = [x.strip() for x in match.groups()]
    rtr = match.group().find("r3tr")==-1 and "r3tr" or "r3xb";
    ret = "(function(){var %s=[];for (var i=0;i<%s.length;i++){var %s=%s[i];if (%s){ %s.push(%s); }};return %s;})()" % (rtr,lst,var,lst,cond or 'true',rtr,do,rtr)
    if debug: print match.group(),"<br>\t",ret.replace("<","&lt;"),"<br>"
    return ret

def forz(match):
    global chs;chs+=1
    var,lst = match.groups()
    var = var.strip();lst=lst.strip()
    ret = "for (var %s in %s){var %s=%s[%s];"%(var,lst,var,lst,var)
    if debug:print ret,"<br>"
    return ret

def convert_ie6(infile,outfile):
    global chs;chs=0
    if not infile.endswith(".js"): raise Exception("Needs a JS file, got %s"%infile)
    text = open(infile).read()
    
    ntext = re.sub("(var)?\s+\[.+?\]\s+=.+?[\n;]",listassn,text)
    ntext = re.sub("\[(.+?)for (each)?\((.+?)in(.+?)\)(.*?)\]",listcomp,ntext)
    ntext = re.sub("(?:[\n^;]\s+)for each\s*\((.+?)in(.+?)\)\s*{",forz,ntext)
    open(outfile,"w").write(ntext)
    print "sanitized %s for ie6. %d changes made<br>"%(infile,chs)

def convert_dir_ie6(dir):
    if not os.path.isdir(os.path.join(dir,"ie")):
        os.mkdir(os.path.join(dir,"ie"))
    [convert_ie6(fl,"ie/"+fl) for fl in os.listdir(dir) if fl.endswith(".js")]
    
os.chdir("..")
convert_ie6("include.js","includeie6.js")
##convert_dir_ie6('.')