TciProtocol
   = res:TciCommand TRAILER {return res}

TciCommand
	= vfo
    / tx_power
    / tx_swr
    / if_limits
    / tune
    / trx

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

float "float"
    = left:[0-9]+ "." right:[0-9]+ { return parseFloat(text()); }

integer "integer"
     = sign:[+-]? digits:[0-9]+ { return parseFloat(text()); }
     
boolean
  = "true"  { return true; }
  / "false" { return false; }
     
  
SEP = ","
TRAILER = ";"

