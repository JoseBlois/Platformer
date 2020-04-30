(function(window,undefined){
var canvas=null,ctx=null;
var player = null;
var KEY_LEFT = 37,KEY_UP=38,KEY_RIGHT=39,KEY_DOWN=40,KEY_ENTER=13;
var pause=false;
var gameover=true;
var pressing = [];
// var k = 1;
// var speed =0;
var lastPress = null;
var wall=[];
var lava=[];
var onGround=true;
var cam=null;
var worldWidth=0,worldHeight=0;
var map0 =[ 
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,2,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,1,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
    [1,0,0,0,0,0,2,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,2,2,0,0,1,0,0,1],
    [0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,2,2,0,0,1,0,0,0],
    [0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,2,2,0,0,1,0,0,0],
    [1,0,0,0,0,0,2,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,2,2,0,0,1,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1,0,0,0,0,0,0,1,0,0,1],
    [1,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,1,1,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
    [1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
    [1,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];
 
//setMap
function setMap(map,blocksize){
    var row=0,rows=0,col=0,columns=0;
    for(row=0,rows=map.length;row<rows;row++){
        for(col=0,columns=map[row].length;col<columns;col++){
            if(map[row][col]===1){
                wall.push(new Rectangle2d(col*blocksize,row*blocksize,blocksize,blocksize,true))
            }else{
                if(map[row][col]===2){
                    lava.push(new Rectangle2d(col*blocksize,row*blocksize,blocksize,blocksize,true))
                }
            }
        }

    }
    worldWidth=columns * blocksize;
    worldHeight=rows * blocksize;

}
function Rectangle2d(x,y,width,height,createFromTopLeft){
    this.width = (width === undefined)?0:width;
    this.height = (height === undefined)?this.width:height;
        if(createFromTopLeft){
            this.left = (x === undefined)?0:x;
            this.top = (y ===undefined)?0:y;
        }else{
            this.x = (x === undefined)?0:x;
            this.y = (y === undefined)?0:y;
        }

}
Rectangle2d.prototype = {
    left : 0,
    top : 0,
    width : 0,
    height : 0,
    vx:0,
    vy:0,

    get x(){
        return (this.left +this.width/2);
    },
    set x(value ){
        this.left = value - this.width/2;
    },
    get y(){
        return (this.top + this.height/2)
    },
    set y(value){
        this.top = value - this.height/2;
    },
    get right(){
        return this.left+this.width;
    },
    set right(value){
        this.left = value - this.width;
    },
    get bottom(){
        return this.top + this.height
    },
    set bottom(value){
        this.top = value - this.height;
    },
    contains : function (rect){
        if(rect !== undefined){
            return(this.left < (rect.x || rect.left)&&
                this.right > (rect.x||rect.right) &&
                this.top < (rect.y || rect.top) &&
                this.bottom > (rect.y || rect.bottom))
        }
    },
    intersects : function (rect){
        if(rect !== undefined){
            return (this.right > rect.left &&
                this.left < rect.right&&
                this.bottom > rect.top &&
                this.top < rect.bottom)
        }
    },
    fill: function(ctx,cam){
        if(ctx !== undefined){
            if(cam!==undefined){
            ctx.fillRect(this.left - cam.x,this.top - cam.y ,this.width,this.height);
            }
        }
    },
    stroke : function(ctx){
        if(ctx !== undefined){
            ctx.strokeRect(this.left,this.top,this.width,this.height);
        }
    }
}
function Camera(x,y){
    this.x = (x===undefined)?0:x;
    this.y = (y===undefined)?0:y;
}
Camera.prototype ={
    focus: function(x,y){
        this.x = x - canvas.width/2
        this.y = y - canvas.height/2;
        if(this.x < 0 ){
            this.x=0;
        }else if(this.x+canvas.width > worldWidth){
            this.x = worldWidth - canvas.width;
        }
        if(this.y < 0 ){
            this.y=0;
        }else if(this.y+canvas.height > worldHeight){
            this.y = worldHeight - canvas.height;
        }
    }
}
function reset(){
    player.vx=0;
    player.vy=0;
    player.left=40;
    player.top=40;
    gameover=false;
}
function enableInput(){
    document.addEventListener('keydown',function(evt){
        if(!pressing[evt.which]){
        lastPress=evt.which;
        }
        pressing[evt.which]=true;
    },false)
    document.addEventListener('keyup',function(evt){
        pressing[evt.which]=false;
    },false)
}
function run(){
    setTimeout(run,50);

    act(0.05)
    lastPress=null;
}
function repaint(){
    window.requestAnimationFrame(repaint);

    paint(ctx)
}

function paint(ctx){
    ctx.fillStyle='#000';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='#fff'
    player.fill(ctx,cam);
    ctx.fillStyle='#999'
    for(var i=0; i<wall.length;i++){
    wall[i].fill(ctx,cam);
    }
    ctx.fillStyle='#f00'
    for(i=0;i<lava.length;i++){
        lava[i].fill(ctx,cam)
    }
    // ctx.fillRect(cam.x,cam.y,10,10);
    if(pause){
        ctx.textAlign='center'
        ctx.fillStyle='#0f0';
        if(gameover){
            ctx.fillText('GAME OVER - ENTER TO RESTART',canvas.width/2,canvas.height/2);
        } else ctx.fillText('PAUSE - ENTER TO CONTINUE',canvas.width/2,canvas.height/2);

    }
    ctx.textAlign='left'
}

function act(deltaTime){
    if(!pause){
        if(gameover){
            reset();
        }
        if(lastPress===KEY_ENTER){
            pause=true;
            lastPress=null;
        }
        cam.focus(player.x,player.y)
        if(pressing[KEY_LEFT]){
            if(player.vx>-10){
                player.vx-=1;
            }
         }else if(player.vx<0){
         player.vx+=1
         }
        if(pressing[KEY_RIGHT]){
         if(player.vx<10){
             player.vx+=1;
         }
        }else if(player.vx>0){
         player.vx-=1
        }
         player.x+=player.vx    

         player.vy +=2;
         if(player.vy>15){
             player.vy=15;
         }
         if(onGround&&lastPress===KEY_UP){
             player.vy=-15;
         }

        for(var i = 0; i<wall.length;i++){
            if(player.intersects(wall[i])){
                 if(player.vx >0){
                     player.right = wall[i].left;
                 }else{
                     player.left = wall[i].right
                 }
                 player.vx=0;
            }
         } 
         // speed+= k;
         onGround=false;
         player.y +=player.vy;
         for(i=0;i<wall.length;i++){
             if(player.intersects(wall[i])){
                 if(player.vy>0){
                         player.bottom=wall[i].top;
                         onGround=true;
                     }else   {
                         player.top=wall[i].bottom
                     }
                     player.vy=0;
                 }
             }
            //  if(player.bottom>canvas.height){
            //  player.bottom=canvas.height
            //  speed =0;
            //  }
             for(i=0;i<lava.length;i++){
                 if(player.intersects(lava[i])){
                     gameover=true;
                     pause=true;
                 }
             }
         }
        if(lastPress===KEY_ENTER){
            pause=false;
            lastPress=null;
        }
}

function init(){
        canvas = document.getElementById('canvas');
        ctx = canvas.getContext('2d');
        canvas.width = 300;
        canvas.height= 200;

        player = new Rectangle2d(40,40,10,10,true);
        cam = new Camera()
        // wall.push(new Rectangle2d(150,190,10,10,true));
        enableInput();
        setMap(map0,10);
        run()
        repaint()
}


    window.addEventListener('load',init(),false)


}(window))