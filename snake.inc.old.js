function findPos(obj) {
    var curleft = curtop = 0;
    if (obj.offsetParent) {
        curleft = obj.offsetLeft
        curtop = obj.offsetTop
        while (obj = obj.offsetParent) {
            curleft += obj.offsetLeft
            curtop += obj.offsetTop
        }
    }
    return [curleft,curtop];
}

function keyCode(e) {
	var code;
	if (!e) var e = window.event;
	if (e.keyCode) code = e.keyCode;
	else if (e.which) code = e.which;
	return code;
}

try{if (!console)console={log:function(){}}}
catch(e){console={log:function(){}}}

SEG_IMG="seg2.gif"
HEAD_IMGS=['left','down','right','up']
var loading = [];
// preload
for each(src in ["hup.gif","hleft.gif","hright.gif","hdown.gif","seg.gif","apple1.gif","apple2.gif","apple3.gif","apple4.gif","death.gif","mongoose.gif"]){
    var img = new Image();
    img.src = src;
    img.style.visibility="hidden";
    img.style.position="absolute";
    document.body.appendChild(img);
    loading.push(img);
    img.onload = function(){
        loading.splice(loading.indexOf(img),1);
    }
}

function mousePos(em,e){
    pos=findPos(em)
    var posx = 0;
    var posy = 0;
    if (!e) var e = window.event;
    if (e.pageX || e.pageY) 	{
        posx = e.pageX;
        posy = e.pageY;
    }
    else if (e.clientX || e.clientY) 	{
        posx = e.clientX + document.body.scrollLeft
            + document.documentElement.scrollLeft;
        posy = e.clientY + document.body.scrollTop
            + document.documentElement.scrollTop;
    }
    a=[posx+pos[0],posy+pos[1]];
    return a;
}



////////////////////////////////  Controller Objects   /////////////////////


Array.prototype.remove=function(x){
    this.pop(this.indexOf(x));
}
Array.prototype.contains=function(x){
    return this.indexOf(x)!=-1;
}
Array.prototype.mult=function(arg){
    e=this
    for (var i=0;i<arg.length;i++){
        e=e[arg[i]];
    }
    return e;
}
Node.prototype.setPos=function(pos){
    this.style.top=pos[1]+'px';
    this.style.left=pos[0]+'px';
}
Node.prototype.pos=function(){
    return [parseInt(this.style.left),parseInt(this.style.top)];
}

function Segment(parent,pos,by){
    that={}
    var img=new Image();
    img.src=SEG_IMG;
    img.className="float";
    pz=findPos(parent);
    img.style.left=pz[0]+pos[1]*by+'px';
    img.style.top=pz[1]+pos[0]*by+'px';
    parent.appendChild(img)
    img.style.zIndex=2
    that.pos=pos
    that.img=img;
    that.move_to=function(poz){
        img.style.top=pz[0]+poz[0]*by+'px';
        img.style.left=pz[1]+poz[1]*by+'px';
        this.pos=poz;
    }
    that.remove=function(){
        img.parentNode.removeChild(img);
    }
    return that;
}

function Block(parent,pos,by){
    var that=new Image();
    that.pos=pos;
    that.className="float";
    pz=findPos(parent)
    that.setPos([pz[0]+pos[0]*by,pz[1]+pos[1]*by]);
    that.src="block.gif"
    parent.appendChild(that);
    return that;
}

function Apple(parent,pos,by,num){
    var that=new Image();
    that.lev=num||1;
    that.pos=pos;
    that.src="apple"+that.lev+'.gif';
    that.className="float"
    var pz=findPos(parent)
    that.setPos([pz[0]+pos[0]*by,pz[1]+pos[1]*by]);
    parent.appendChild(that);
    return that;
}

function Mongoose(parent,what,pos,size){
    var that=new Image();
    that.style.zIndex=10;
    that.pos=pos;
    that.src='mongoose.gif';
    that.className="float";
    var pz=findPos(parent)
    that.setPos([pz[0]+pos[0]*size.by,pz[1]+pos[1]*size.by]);
    parent.appendChild(that);
    /*************************   WORK HERE **********************/
    function follow(){
        if (Math.random()*10<7)return;
        var [y,x] = what.pos;
        var [a,b] = that.pos;
        var deg = Math.atan2(y-b,x-a)/Math.PI*180;
        if (deg<0){deg+=360;}
        var part = 45/2
        var dir = Math.round(deg/45) // 0-9
        var dirs = [[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1],[1,0]];
        //console.log(deg,dir)
        move(dirs[dir],true);
        //pass
    }
    function move(pos,rel){
        if (rel){
            that.pos[0]+=pos[0];
            that.pos[1]+=pos[1];
        }else{
            that.pos = pos;
        }
        
        //if (that.pos[0]>Math.round(size.w/size.by)){console.log(size.w,size.by,that.pos);that.pos[0]=0;}
        //if (that.pos[0]<0){that.pos[0]=Math.round(size.w/size.by)}
        //if (that.pos[1]>Math.round(size.h/size.by)){that.pos[1]=0;}
        //if (that.pos[1]<0){that.pos[1]=Math.round(size.h/size.by)}
        
        var pz=findPos(parent)
        that.setPos([pz[0]+that.pos[0]*size.by,pz[1]+that.pos[1]*size.by]);
    }
    that.step = function(){
        follow();
    }
    
    return that;
}

function Death(parent,pos,by){
    var that = new Image();
    that.style.zIndex=5;
    that.pos = pos;
    that.src = "spike3.gif";
    that.className = "float";
    var pz=findPos(parent)
    that.setPos([pz[0]+pos[0]*by,pz[1]+pos[1]*by]);
    parent.appendChild(that);
    return that;
}

snakegamez=document.body.appendChild(document.createElement('div'));

snake=function (parent,size){
    /*var container=parent.appendChild(document.createElement('div'));
    container.className="float";
    container.style.width=size.h+'px';
    container.style.height=size.w+'px';*/
    var lspeed = document.body.appendChild(document.createElement("div"))
    lspeed.style.top=lspeed.style.left="0px";
    lspeed.style.opacity=".5";
    
    var that={}
    that._size=size;
    
    document.onkeypress=function(e){
        switch (keyCode(e)){
        case 37:that.dir=0;break
        case 38:that.dir=3;break
        case 39:that.dir=2;break
        case 40:that.dir=1;break
        case 32:that.dopause();break
        }
        //console.log(keyCode(e));
    }
    
    
    that.paused = false;
    that.start=function(info){//alert("start!");
        that.paused = false;
        that.pausedtime = 0;
        while (parent.childNodes.length){
            parent.removeChild(parent.firstChild);
        }
        this.starttime=new Date().getTime();
        if (info)this.latest=info;
        else info=this.latest;
        this.head=parent.appendChild(new Image());
        this.head.src='h'+HEAD_IMGS[info.dir||1]+'.gif';
        this.head.className="float"
        this.pos=info.pos || [0,0];
        pz=findPos(parent);
        this.head.style.top=pz[0]+this.pos[0]*size.by+'px';
        this.head.style.left=pz[1]+this.pos[1]*size.by+'px';
        this.head.style.zIndex=2
        this.dir=info.dir || 1;
        this.score=0;
        this.speed=info.speed || 500;
        this.segs=[];
        this.moving=1;
        for (var i=0;i<(info.len || 5);i++){
            this.segs.push(Segment(parent,this.pos,size.by));
        }
        this.apples=[];
        that.deaths = [];//alert("initiating mongeese");
        that.mongeese = [];
        this.blocks=info.blocks?info.blocks.map(function(e){Block(parent,e,size.by)}):[];
        this.warps=info.warps?info.warps.map(function(e){Warp(parent,e,size.by)}):[];
        that=this;
        
        
        function apples(){
            if (that.paused)return;
            that.makeapple();
            if (that.moving)setTimeout(apples,Math.random()*3000);
        }
        function deaths(){
            if (that.paused)return;
            that.makedeath();
            if (that.moving)setTimeout(deaths,Math.random()*15000);
        }
        setTimeout(apples,Math.random()*3000);
        setTimeout(deaths,Math.random()*15000);
        
        
        setTimeout(function(){that.next(1)},this.speed);
    }
    that.pause = function(){
        that.paused = true;
        that.pausetimer = new Date().getTime();
    }
    that.unpause = function(){
        that.pausedtime+= new Date().getTime() - that.pausetimer;
        that.paused = false;
        function apples(){
            if (this.paused)return;
            that.makeapple();
            if (that.moving)setTimeout(apples,Math.random()*3000);
        }
        function deaths(){
            if (this.paused)return;
            that.makedeath();
            if (that.moving)setTimeout(deaths,Math.random()*15000);
        }
        setTimeout(apples,Math.random()*3000);
        setTimeout(deaths,Math.random()*15000);
        setTimeout(function(){that.next(1)},this.speed);
    }
    that.dopause = function(){
        if (that.paused)that.unpause();
        else that.pause();
    }
    that.makeapple=function(){
        var y=Math.round(Math.random()*size.w/size.by);
        var x=Math.round(Math.random()*size.h/size.by);
        this.apples.push(Apple(parent,[x,y],size.by,Math.floor(Math.random()*4)+1))
    }
    that.makedeath=function(){
        var y=Math.round(Math.random()*size.w/size.by);
        var x=Math.round(Math.random()*size.h/size.by);
        this.deaths.push(Death(parent,[x,y],size.by));
    }
    that.makemongoose=function(){
        var y=Math.round(Math.random()*size.w/size.by);
        var x=Math.round(Math.random()*size.h/size.by);
        this.mongeese.push(Mongoose(parent,that,[x,y],size));
    }
    that.next=function(st){
        if (this.paused)return;
        if (this.moving){
            if (this.speed>80)
                this.speed-=.1;
            else if (this.speed>50)
                this.speed-=.05;
            else this.speed-=.01;
            lspeed.innerHTML = this.speed;
            opos=[this.pos[0],this.pos[1]]
            this.head.src='h'+HEAD_IMGS[this.dir]+'.gif'
            
            for (var i=0;i<this.segs.length-1;i++){
                this.segs[i].move_to(this.segs[i+1].pos);
            }
            //alert("mapping mongeese");
            for (var i=0;i<this.mongeese.length;i++){
                this.mongeese[i].step();
            }
            switch (this.dir){
                case 0:this.pos[1]-=1;
            break
                case 1:this.pos[0]+=1;
            break
                case 2:this.pos[1]+=1;
            break
                case 3:this.pos[0]-=1;
            break
                }
                
            this.segs[this.segs.length-1].move_to(opos);
            
        
         /*   if (this.pos[0]>size.w/size.by ||   // Use this to have auto walls
                this.pos[0]<0 || 
                this.pos[1]<0 || 
                this.pos[1]>size.h/size.by){
                    this.moving=0;
            }  */
            if (this.pos[0]>Math.round(size.w/size.by)){this.pos[0]=0;}
            if (this.pos[0]<0){this.pos[0]=Math.round(size.w/size.by)}
            if (this.pos[1]>Math.round(size.h/size.by)){this.pos[1]=0;}
            if (this.pos[1]<0){this.pos[1]=Math.round(size.h/size.by)}
            pz=findPos(parent);
            this.head.style.top=pz[0]+this.pos[0]*size.by+'px';
            this.head.style.left=pz[1]+this.pos[1]*size.by+'px';
            
            c=0;
            for (var i=0;i<this.segs.length;i++){ // check for collissions
                if (this.segs[i].pos[0]==this.pos[0] && 
                    this.segs[i].pos[1]==this.pos[1]){if (!st){
                        this.moving=0;
                        }else{c=1}
                        break;
                }
            }
            //for (var i=0;i<this.rocks.length
            
            var that=this;
            // check for deaths
            this.deaths.map(function(e){
                if (that.pos[0]==e.pos[1] && 
                that.pos[1]==e.pos[0]){
                    that.moving = 0;
                    try{
                    e.parentNode.removeChild(e);}catch(ex){}
                }
            })
            
            this.apples.map(function(e){
                if (that.pos[0]==e.pos[1] && 
                that.pos[1]==e.pos[0]){
                    that.addSegments(e.lev);
                    try{
                    e.parentNode.removeChild(e);}catch(ex){}
                }
            })
            that.mongeese.map(function(e){
                if (that.pos[0]==e.pos[1] && 
                that.pos[1]==e.pos[0]){
                    that.moving = 0;
                    try{
                    e.parentNode.removeChild(e);}catch(ex){}
                }
            })
            
        }
        else{
            var that=this;
            dt=Math.round((new Date().getTime()-this.starttime-this.pausedtime)*10)/10000
            avg=Math.round(this.score/dt*100)/100
            Alert("Ouch!! Your score was "+this.score+". <br>You Got an average of "+avg+" points per second<br> over a period of "+dt+" seconds.<br>Try Again?",[function(){snake.start({speed:100})},"Hard"], [function(){snake.start({speed:300})},"Medium"], [function(){snake.start({speed:600})},"Easy"])
            return
        }
        var that=this;
        setTimeout(function(){that.next(c)},this.speed);
    }
    that.addSegments=function(num){
        var lpos=this.segs[0].pos
        for (var i=0;i<num;i++){
            this.score++;
            this.segs=[Segment(parent,lpos,size.by)].concat(this.segs);
        }
        // mongeese?
        if (Math.floor(this.score/10)>that.mongeese.length){
            that.makemongoose();
        }
    }
    return that;
}(snakegamez,{h:window.innerWidth-50,w:window.innerHeight-50,by:20})

//document.addEventListener("keypress"
//snake


function Alert(message){

    var over=document.body.appendChild(document.createElement('div'))
    over.style.position="absolute"
    over.style.top='0px'
    over.style.left='0px'
    over.style.opacity=.7
    over.style.zIndex=1000;
    over.style.backgroundColor="black"
    over.style.width=window.innerWidth+'px';
    over.style.height=window.innerHeight+'px';
    var alert=document.body.appendChild(document.createElement('div'));
    alert.style.position="absolute"
    alert.style.zIndex=1001;
    alert.style.padding='20px'
    alert.style.backgroundColor='#D5FF85'
    alert.style.border='solid 2px #90AA20'
    alert.appendChild(document.createElement('p')).innerHTML=message;
    args=arguments
    buttons=alert.appendChild(document.createElement('div'));
    buttons.style.marginLeft="20px"
    for (var i=1;i<arguments.length;i++){
        var b=buttons.appendChild(document.createElement('button'))
        b.style.border='solid 1px #90AA20'
        b.innerHTML=arguments[i][1] || "Ok"
        b.f=arguments[i][0]
        b.addEventListener('click',function(){
            document.body.removeChild(over);
            document.body.removeChild(alert);
            this.f();
        },true);
    }
    
    alert.style.top=window.innerHeight/2-alert.offsetHeight/2+'px'
    alert.style.left=window.innerWidth/2-alert.offsetWidth/2+'px'
}





Alert("Welcome to JsSnake!",[function(){snake.start({speed:100})},"Hard"], [function(){snake.start({speed:300})},"Medium"], [function(){snake.start({speed:600})},"Easy"])

