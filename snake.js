

function Game(screen){
    that = {};
    that.fps = 20;
    that.screen = screen;
    that.running = false;
    that.objects = [];
    
    that.compute_size = function(){
        if (!that.screen)return;
        var w = that.screen.offsetWidth;
        var h = that.screen.offsetHeight;
        var [x,y] = findPos(that.screen);
        that.size = {"width":w,"height":h,"x":x,"y":y};
    }
    that.step = function(){
        that.objects.map(function(x){x.step();});
        setTimeout(that.step,1000.0/that.fps);
    }
    that.event = function(e){
        that.objects.map(function(x){x.event(e);});
    }
    that.register_events = function(){
        that.screen.onclick = that.event;
        document.onkeypress = that.event;
        document.body.style.overflow="hidden";
    }
    that.start = function(){
        that.running=true;
        that.step();
    }
    
    that.compute_size();
    that.register_events();
    return that;
}


function JsSnake(screen,config){
    var that = Game(screen);
    that.screen = screen;
    that.score = that.screen.appendChild(cE("div"));
    that.score.style.fontSize="80pt";
    that.score.style.fontFamily = "ariel,sans-serif";
    that.score.style.color="#EEE";
    that.score.innerHTML="0";
    that.fps = config && config.fps || 10;
    
        var pi = document.body.appendChild(cE("div"));
        pi.style.visibility = "hidden";
        pi.style.position = "absolute";
        pi.style.left = "50%";
        pi.style.top = "50%";
        pi.style.fontSize = "2em";
        //pi.style.width = "100px"
        pi.innerHTML = "paused";
        pi.style.fontFamily = "ariel,sans-serif";
        pi.style.color="#CCC";
        //pi.style.opacity = 0.5;
        pi.style.marginLeft = -(pi.offsetWidth/2)+"px";
        pi.style.marginTop = -(pi.offsetHeight/2)+"px";
        that.pausei = pi;
    
    that.compute_size = function(){
        if (!that.screen)return;
        var img_size = 20;
        var w = Math.floor(that.screen.offsetWidth/img_size)*img_size;
        var h = Math.floor(that.screen.offsetHeight/img_size)*img_size;
        that.size = {"w":w/img_size,"h":h/img_size,"s_w":w,"s_h":h,"by":img_size};
    }
    
    that.load = function(){
        preload(function(){},"explode_fire.gif","hup.gif","hleft.gif","hright.gif","hdown.gif","seg.gif","apple1.gif","apple2.gif","apple3.gif","apple4.gif","death.png","mongoose.gif");
        
        Alert("Welcome to JsSnake!",[function(){that.fps = 10;that.start()},"Hard"], [function(){that.fps = 3; that.start()},"Medium"], [function(){that.fps = 1.5;that.start()},"Easy"])
    }
    
    that.make = function(group,_class){
        return function(){group.push(_class(that));}
    }
    
    that.clear = function(){
        [obj.remove() for each(obj in that.objects)];
    }
    
    that.start = function(){
        that.clear();
        that.apples = [];
        that.deaths = [];
        that.mongeese = [];
        that.objects = [];
        that.all_pos = [];
        that.teleports = [];//[Teleport(that,[2,2],[8,8]),Teleport(that,[8,8],[2,2])];
        //that.make_teleport();
        
        
        that.starttime = new Date().getTime();
        that.pausedtime = 0;
        that.pausetime = null;
        that.running = true;
        that.snake = Snake(that,[0,0],4);
        that.objects.push(that.snake);
        that.step();
        setTimeout(that.make_apples,Math.random()*3000);
        setTimeout(that.make_deaths,Math.random()*15000);
        setTimeout(that.make_teleport,Math.random()*100);
        setTimeout(that.make_teleport,Math.random()*100);
    }
    
    that.pause = function(){
        that.paused = true;
        that.pausetime = new Date().getTime();
        that.pausei.style.visibility = "visible";
    }
    
    that.unpause = function(){
        that.pausei.style.visibility = "hidden";
        that.paused = false;
        that.pausedtime += new Date().getTime()-that.pausetime;
        that.pausetime = null;
        that.step();
        setTimeout(that.make_apples,Math.random()*3000);
        setTimeout(that.make_deaths,Math.random()*15000);
        //setTimeout(that.make_teleport,Math.random()*100);
        //setTimeout(that.make_teleport,Math.random()*100);
    }
    
    that.check_pos = function(pos){
        for each(a in that.apples){if (a.collide(pos))return false;}
        for each(d in that.deaths){if (d.collide(pos))return false;}
        for each(m in that.mongeese){if (m.collide(pos))return false;}
        for each(s in that.snake.segs){if (s.collide(pos))return false;}
        if (that.snake.collide(pos))return false;
        /*for each(o in that.objects){if (o.collide(pos))return false;}*/
        return true;
    }
    
    that.make_apples = function(){
        if (that.paused || !that.running)return;
        var apple = Apple(that);
        that.apples.push(apple);
        that.objects.push(apple);
        setTimeout(that.make_apples,Math.random()*3000);
    }
    
    that.make_teleport = function(){
        if (that.paused || !that.running)return;
        //console.log("making tel");
        var p1 = randPos(that);
        var p2 = randPos(that);
        //console.log("making tel",p1,p2);
        var tel1 = Teleport(that,p1,p2);
        var tel2 = Teleport(that,p2,p1);
        that.objects.push(tel1);
        that.objects.push(tel2);
        that.teleports.push(tel1);
        that.teleports.push(tel2);
        //setTimeout(that.make_teleport,Math.random()*20000+5000);
    }
    
    that.make_deaths = function(){
        if (that.paused || !that.running)return;
        var death = Death(that);
        that.deaths.push(death);
        that.objects.push(death);
        setTimeout(that.make_deaths,Math.random()*15000);
    }
    
    that.make_mongoose = function(){
        var mongoose = Mongoose(that);
        that.mongeese.push(mongoose);
        that.objects.push(mongoose);
    }
    
    that.step = function(){
        if (that.paused || !that.running)return;
        that.objects.map(function(x){x.step();});
        that.score.innerHTML = that.snake.score
        if (that.running)
            setTimeout(that.step,1000/that.fps);
    }
    that.compute_size(config);
    return that;
}

function Sprite(parent,img,pos){
    var that = new Image();
    that.style.position = "absolute";
    that.pos = [0,0];
    that.pos[0] = pos[0];
    that.pos[1] = pos[1];
    that.remove = function(){
        try{parent.screen.removeChild(that);}
        catch(e){}
    }
    that.collide = function(pos){
        var xs = (pos[0]==that.pos[0]);
        var ys = (pos[1]==that.pos[1]);
        return (xs && ys);
    }
    that.move = function(pos,rel){
        if (rel){
            that.pos[0]+=pos[0];
            that.pos[1]+=pos[1];
        }else{
            that.pos[0] = pos[0];
            that.pos[1] = pos[1];
        }
        that.update();
    }
    that.update = function(){
        var [x,y] = that.pos;
        var [a,b] = findPos(parent.screen)
        setPos(that,[parent.size["by"]*x+a,parent.size["by"]*y+b]);
    }
    that.step = function(){};
    that.event = function(){};
    that.src = img;
    that.move(pos);
    parent.screen.appendChild(that);
    return that;
}

function randPos(parent){
    while(true){
        var x=Math.floor(Math.random()*parent.size.w);
        var y=Math.floor(Math.random()*parent.size.h);
        if (parent.check_pos([x,y]))break;
    }
    parent.all_pos.push([x,y]);
    return [x,y];
}

function Apple(parent){
    var lev = Math.floor(Math.random()*4)+1
    var that = Sprite(parent,"apple"+lev+".gif",randPos(parent));
    that.lev = lev;
    return that;
}

function Death(parent){
    var that = Sprite(parent,"death.png",randPos(parent));
    return that;
}


function Explosion(parent,pos,fnc){
    var that = Sprite(parent,"explode_fire.gif",[pos[0]-1,pos[1]-1]);
    that.kill = function(){that.remove();if (fnc)fnc();}
    setTimeout(that.kill,800);
    return that;
}

function Mongoose(parent){
    var that = Sprite(parent,"mongoose.gif",randPos(parent));
    that.step = function(){
        if (Math.random()*10<7)return;
        
        var [x,y] = parent.snake.pos;
        var [a,b] = that.pos;
        var deg = Math.atan2(y-b,x-a)/Math.PI*180;
        if (deg<0){deg+=360;}
        var dir = Math.round(deg/45) // 0-9
        var dirs = [[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1],[1,0]];
        var good = true;
        parent.snake.segs.map(function(s){
            if (s.collide([that.pos[0]+dirs[dir][0],that.pos[1]+dirs[dir][1]]))good = false;
        });
        parent.apples.map(function(a){
            if (a.collide([that.pos[0]+dirs[dir][0],that.pos[1]+dirs[dir][1]]))good = false;
        });
        parent.mongeese.map(function(m){
            if (m!=that && m.collide([that.pos[0]+dirs[dir][0],that.pos[1]+dirs[dir][1]]))good = false;
        });
        if (good)
            that.move(dirs[dir],true);
            
        parent.deaths.map(function(d){
            if (that.collide(d.pos)){that.remove();
            parent.objects.push(Explosion(parent,that.pos));}
        });
    }
    return that;
}

function Teleport(parent,pos,to_pos){
    var that = Sprite(parent,"teleport.png",pos);
    that.to_pos = to_pos;
    return that;
}

function Snake(parent,pos,num_segs){
    var that = Sprite(parent,"hdown.gif",pos);
    var head_imgs = ['right','down','left','up'];
    that.segs = [];
    that.dirz = 1;
    that.score = 0;
    
    that._remove = that.remove;
    that.remove = function(){
        [seg.remove() for each(seg in that.segs)];
        that._remove();
    }
    
    that.event = function(e){
        if (e.type=="keypress"){
            switch (keyCode(e)){
                case 37:that.dirz=2;break
                case 38:that.dirz=3;break
                case 39:that.dirz=0;break
                case 40:that.dirz=1;break
                case 32:that.dopause();break
            }
            that.src = "h"+head_imgs[that.dirz]+".gif";
        }
    }
    that.dopause = function(){
        if (parent.paused)parent.unpause();
        else parent.pause();
        
    }
    that.die = function (){
        var deathpos = 0;
        function metadie(){
            if (deathpos>=that.segs.length){
                setTimeout(that.restart,1000);
                return;
            }
            that.segs[deathpos].shrink();
            //console.log(metadie);
            //Explosion(parent,that.segs[deathpos].pos);
            deathpos+=1;
            setTimeout(metadie,50);
        }
        parent.objects.push(Explosion(parent,that.pos));
        that._remove();
        parent.running = false;
        parent.fps = 20;
        setTimeout(metadie,200);
        //setTimeout(that.restart,1000);
    }
    
    that.restart = function(){
        var dt=Math.round((new Date().getTime()-parent.starttime-parent.pausedtime-1000)*10)/10000;
        var avg=Math.round(that.score/dt*100)/100;
        Alert("Ouch!! Your score was "+that.score+". <br>You Got an average of "+avg+" points per second<br> over a period of "+dt+" seconds.<br>Try Again?",[function(){parent.fps=10;parent.start()},"Hard"], [function(){parent.fps=3;parent.start()},"Medium"], [function(){parent.fps=1.5;parent.start()},"Easy"]);
    }
    that.log_segs = function(){
        console.log("These are the posss");
        var posss = [];that.segs.map(function(s){posss.push(s.pos);});console.log(posss);
        }
    that.step = function(){
        /** check the mongeese **/
        
        parent.mongeese.map(function(m){
            if (that.collide(m.pos))that.die();
        });
        
        /** speed up gradually **/
        if (parent.fps<12) parent.fps+=.016;
        else if (parent.fps<20) parent.fps+=.008;
        else parent.fps+=.0016;
        // move the segments
        reversed(that.segs).map(function(x){x.follow();});
        
        var dpos = [[1,0],[0,1],[-1,0],[0,-1]][that.dirz];
        that.move(dpos,1);
        
        // loop around the back
        if (that.pos[0]<0){that.pos[0] = parent.size.w-1;}
        else if (that.pos[0]>parent.size.w-1){that.pos[0] = 0;}
        else if (that.pos[1]<0){that.pos[1] = parent.size.h-1;}
        else if (that.pos[1]>parent.size.h-1){that.pos[1] = 0;}
        var br = 0;
        parent.teleports.map(function(t){if (br)return;
            if (that.collide(t.pos)){
                //that.pos = t.to_pos;
                that.pos[0] = t.to_pos[0];
                that.pos[1] = t.to_pos[1];
                br = true;
            }
            //console.log(that.collide(t.pos))
        });
        
        that.update();
        that.segs.map(function(s){
            if (that.collide(s.pos))that.die();
        });
        parent.deaths.map(function(d){
            if (that.collide(d.pos))that.die();
        });
        parent.apples.map(function(a){
            if (that.collide(a.pos)){
                that.score+=a.lev;
                that.addSegs(a.lev);
                a.remove();
            }
        });
        parent.mongeese.map(function(m){
            if (that.collide(m.pos))that.die();
        });
    }
    that.addSegs = function(num){
        for (var i=0;i<num;i++){
            var last = that.segs.slice(-1)[0] || that;
            that.segs.push(Seg(parent,last.pos,last));
        }
        if ((that.segs.length-num_segs)/10>=parent.mongeese.length+1)
            parent.make_mongoose();
    }
    
    that.addSegs(num_segs);
    
    return that;
}
function int(x){return parseInt(x);}
function Seg(parent,pos,to_follow){
    pos = [pos[0],pos[1]];
    var that = Sprite(parent,"seg2.gif",pos);
    that.follow = function(){
        that.move([to_follow.pos[0],to_follow.pos[1]]);
    }
    that.shrink = function(){
        var sz = 10;
        that.width = 20;
        function meta_shrink(){
            that.width -= 2;//*= .9;
            that.style.top = int(that.style.top)+1+"px";
            that.style.left = int(that.style.left)+1+"px";
            sz-=1;
            if (sz<=0){
                that.remove();
                return;
            }
            setTimeout(meta_shrink,20);
        }
        meta_shrink();
    }
    return that;
}

var game = JsSnake($("screen"));
game.load();