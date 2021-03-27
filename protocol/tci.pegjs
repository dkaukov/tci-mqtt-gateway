TciProtocol
   = res:TciCommand TRAILER {return res}

TciCommand
	= vfo
    / tx_power
    / tx_swr
    / if_limits
    / tune
    / trx
    / device
    / modulation
    / ready
    / rxsmeter
    / drive
    / tune_drive

vfo
	= "vfo:" receiver:integer SEP channel:integer SEP freq:integer 
    {return {cmd: "vfo", data:{receiver:receiver, channel:channel, freq:freq}}; }  

tx_power
	= "tx_power:" power:float 
    {return {cmd: "tx_power", data:{tx_power:power}}; }  
    
tx_swr
	= "tx_swr:" swr:float 
    {return {cmd: "tx_swr", data:{tx_swr:swr}}; }      

if_limits
	= "if_limits:" min:integer SEP max:integer 
    {return {cmd: "if_limits", data:{if_min:min, if_max: max}}; }  
    
tune
	= "tune:" channel:integer SEP enabled:boolean 
    {return {cmd: "tune", data:{channel:channel, enabled: enabled}}; }      

trx
	= "trx:" channel:integer SEP enabled:boolean 
    {return {cmd: "trx", data:{channel:channel, enabled: enabled}}; }  

device
   = "device:"  name:string 
    {return {cmd: "device", data:{name: name}}; }

modulation
   = "modulation:" receiver:integer SEP mode:boolean
    {return {cmd: "modulation:", data:{receiver:receiver, mode:mode}}; }

ready
    = "ready:" state:string
    {return {cmd: "ready", data:{state:state}}; }

rxsmeter
    = "rx_smeter:" eceiver:integer SEP channel:integer SEP signal:integer
    {return {cmd: "rx_smeter", data:{receiver:receiver, channel:channel, signal:signal}}; } 

drive
    = "drive:" power:boolean 
    {return {cmd: "drive", data:{power: power}}; }

tune_drive
    = "tune_drive:" power:boolean 
    {return {cmd: "tune_drive", data:{power: power}}; }

float "float"
    = left:[0-9]+ "." right:[0-9]+ { return parseFloat(text()); }

integer "integer"
     = sign:[+-]? digits:[0-9]+ { return parseFloat(text()); }
     
string "string"
     = [a-zA-Z0-9_/\!@#$%]* {return text();}

boolean
  = "true"  { return true; }
  / "false" { return false; }
     
  
SEP = ","
TRAILER = ";"

