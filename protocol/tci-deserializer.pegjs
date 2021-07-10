{
    function setupTrx(state, trx, channel) {
            if (typeof state.trx === 'undefined') {
                state.trx = [];
            }
            if (typeof state.trx[trx] === 'undefined') {
                state.trx[trx] = {};
            }
            if (typeof channel != 'undefined') {
                if (typeof state.trx[trx].ch === 'undefined') {
                    state.trx[trx].ch = [];
                }
                if (typeof state.trx[trx].ch[channel] === 'undefined') {
                    state.trx[trx].ch[channel] = {};
                }        
            }
            return state;
    }
}

TciProtocol
   = res:TciCommand TRAILER {return res}

TciCommand
	= vfo
    / tx_power
    / tx_swr
    / if_limits
    / tune
    / trx
    / tx_enable
    / rx_enable
    / rx_mute
    / device
    / protocol
    / modulation
    / ready
    / rx_smeter
    / drive
    / tune_drive

vfo
	= "vfo:" trx:integer SEP channel:integer SEP freq:integer 
    {return {
        cmd: "vfo", 
        data:{trx:trx, channel:channel, freq:freq}, 
        topic: () => `vfo/${trx}/${channel}`,
        toState: (state) => {
            setupTrx(state, trx, channel).trx[trx].ch[channel].freq = freq;
            return state;
        }};
    }  

tx_power
	= "tx_power:" power:float 
    {return {
        cmd: "tx_power", 
        data:{power:power}, 
        topic: () => `tx_power`,
        toState: (state) => {
            state.tx_power = power; 
            return state;
        }}; 
    }  
    
tx_swr
	= "tx_swr:" swr:float 
    {return {
        cmd: "tx_swr", 
        data:{swr:swr}, 
        topic: () => `tx_swr`,
        toState: (state) => {
            state.tx_swr = swr; 
            return state;
        }}; 
    }      

if_limits
	= "if_limits:" min:integer SEP max:integer 
    {return {
        cmd: "if_limits", 
        data:{min: min, max: max}, 
        topic: () => `if_limits`,
        toState: (state) => {
            state.ifMin = min; 
            state.ifMax = max; 
            return state;
        }}; 
    }  
    
tune
	= "tune:" trx:integer SEP enabled:boolean 
    {return {
        cmd: "tune", 
        data:{trx:trx, enabled: enabled}, 
        topic: () => `tune/${trx}`,
        toState: (state) => {
            setupTrx(state, trx).trx[trx].tune = enabled;
            return state;
        } }; 
    }      

trx
	= "trx:" trx:integer SEP enabled:boolean 
    {return {
        cmd: "trx", 
        data:{trx:trx, enabled: enabled}, 
        topic: () => `trx/${trx}`,
        toState: (state) => {
            setupTrx(state, trx).trx[trx].active = enabled;
            return state;
        }}; 
    }  

tx_enable
	= "tx_enable:" trx:integer SEP enabled:boolean 
    {return {
        cmd: "tx_enable", 
        data:{trx:trx, enabled: enabled}, 
        topic: () => `tx_enable/${trx}`,
        toState: (state) => {
            setupTrx(state, trx).trx[trx].tx_enabled = enabled;
            return state;
        }}; 
    }     

rx_enable
	= "rx_enable:" trx:integer SEP enabled:boolean 
    {return {
        cmd: "rx_enable", 
        data:{trx:trx, enabled: enabled}, 
        topic: () => `rx_enable/${trx}`,
        toState: (state) => {
            setupTrx(state, trx).trx[trx].rx_enabled = enabled;
            return state;
        }}; 
    }    

rx_mute
	= "rx_mute:" trx:integer SEP mute:boolean 
    {return {
        cmd: "rx_mute", 
        data:{trx:trx, mute: mute}, 
        topic: () => `rx_mute/${trx}`,
        toState: (state) => {
            setupTrx(state, trx).trx[trx].mute = mute;
            return state;
        }}; 
    }  

device
   = "device:"  name:string 
    {return {
        cmd: "device", 
        data:{name: name}, 
        topic: () => `device`,
        toState: (state) => {
            if (typeof state.device === 'undefined') {
                state.device = {};
            }
            state.device.name = name;
            return state;
        }}; 
    }

protocol
   = "protocol:"  type:string SEP version:string
    {return {
        cmd: "protocol", 
        data:{type: type, version: version}, 
        topic: () => `protocol`,
        toState: (state) => {
            if (typeof state.protocol === 'undefined') {
                state.protocol = {};
            }
            state.protocol.type = type;
            state.protocol.version = version;
            return state;
        }}; 
    }    

modulation
   = "modulation:" trx:integer SEP mode:string
    {return {
        cmd: "modulation", 
        data:{trx:trx, mode:mode}, 
        topic: () => `modulation/${trx}`,
        toState: (state) => {
            setupTrx(state, trx).trx[trx].mode = mode;
            return state;
        }}; 
    }

ready
    = "ready" 
    {return {
        cmd: "ready", 
        data:{ready: true}, 
        topic: () => `ready`,
        toState: (state) => {
            state.ready = true;
            return state;
        }};
    }

rx_smeter
    = "rx_smeter:" trx:integer SEP channel:integer SEP signal:integer
    {return {
        cmd: "rx_smeter", 
        data:{trx:trx, channel:channel, signal:signal}, 
        topic: () => `rx_smeter/${trx}/${channel}`,
        toState: (state) => {
            setupTrx(state, trx, channel).trx[trx].ch[channel].signal = signal;
            return state;
        }}; 
    } 


drive
    = "drive:" trx:integer SEP power:float 
    {return {
        cmd: "drive", 
        data:{trx:trx, power: power},
        topic: () => `drive/${trx}`,
        toState: (state) => {
            setupTrx(state, trx).trx[trx].tx_power_pct = power;
            return state;
        }}; 
    }

tune_drive
    = "tune_drive:" trx:integer SEP power:float 
    {return {
        cmd: "tune_drive", 
        data:{trx:trx, power: power},
        topic: () => `tune_drive/${trx}`,
        toState: (state) => {
            setupTrx(state, trx).trx[trx].tune_power_pct = power;
            return state;
        }}; 
    }

float "float"
    = sign:[+-]? (left:[0-9]+ ".")? right:[0-9]+ { return parseFloat(text()); }

integer "integer"
     = sign:[+-]? digits:[0-9]+ { return parseFloat(text()); }
     
string "string"
     = [a-zA-Z0-9_/\!@#$%.]* {return text();}

boolean
  = "true"  { return true; }
  / "false" { return false; }
     
  
SEP = ","
TRAILER = ";"

