/*jslint bitwise: true, es5: true */
(function(window,undefined){
    'use strict';
var canvas=null,ctx=null;
var player = null;
var KEY_LEFT = 37,KEY_UP=38,KEY_RIGHT=39,KEY_DOWN=40,KEY_ENTER=13;
var pause=false;
var gameover=true;
var pressing = [];
// var k = 1;
// var speed =0;
var spritesheet = new Image();
var lastPress = null;
var wall=[];
var lava=[];
var onGround=true;
var elapsed =0;
var cam=null;
var worldWidth=0,worldHeight=0;
var map0 =[            
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],            
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],            
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],            
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],            
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 0, 0, 2],            
    [2, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 0, 0, 2],            
    [2, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],            
    [2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],            
    [2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],            
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];
 
//setMap
function setMap(map,blocksize){
    var row=0,rows=0,col=0,columns=0;
    var rect = null;
    for(row=0,rows=map.length;row<rows;row++){
        for(col=0,columns=map[row].length;col<columns;col++){
            if(map[row][col]>0){
                rect = new Rectangle2d(col * blocksize, row*blocksize,blocksize,blocksize,true);
                rect.type=map[row][col];
                wall.push(rect);
            }
            // if(map[row][col]===1){
            //     wall.push(new Rectangle2d(col*blocksize,row*blocksize,blocksize,blocksize,true))
            // }else{
            //     if(map[row][col]===2){
            //         lava.push(new Rectangle2d(col*blocksize,row*blocksize,blocksize,blocksize,true))
            //     }
            // }
        }

    }
    worldWidth=columns * blocksize;
    worldHeight=rows * blocksize;

}
function Rectangle2d(x,y,width,height,createFromTopLeft){
    this.width = (width === undefined)?0:width;
    this.height = (height === undefined)?this.width:height;
    this.scale = { x:1, y:1};
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
    type:0,

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
    },
    drawImageArea : function (ctx,cam,img,sx,sy,sw,sh){
        if(ctx!== undefined){
            if(img.width){
                ctx.save()
                if(cam!==undefined){
                    ctx.translate(this.x-cam.x,this.y-cam.y);
                }else{
                    ctx.translate(this.x,this.y);
                }
                ctx.scale(this.scale.x,this.scale.y);
                ctx.drawImage(img,sx,sy,sw,sh,-this.width/2,-this.height/2,this.width,this.height)
                ctx.restore()
            }else{
                if(cam !== undefined){
                    ctx.strokeRect(this.left - cam.x ,this.top - cam.y ,this.width,this.height);
                }else{
                    ctx.strokeRect(this.left,this.top,this.width,this.height);                }
            }
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
    player.left=48;
    player.top=16;
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
    if(!onGround){
        player.drawImageArea(ctx,cam,spritesheet,16,16,16,32);
    }else if(player.vx ===0){
        player.drawImageArea(ctx,cam,spritesheet,0,16,16,32);
        }else{
            player.drawImageArea(ctx,cam,spritesheet,(~~(elapsed*10)%2)*16,16,16,32);
        }
    
    ctx.fillStyle='#999'
    for(var i=0; i<wall.length;i++){
    wall[i].drawImageArea(ctx,cam,spritesheet,(wall[i].type -1) * 16,0,16,16);
    }
    // ctx.fillStyle='#f00'
    // for(i=0;i<lava.length;i++){
    //     lava[i].fill(ctx,cam)
    // }
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
            //Changing the image scale
            player.scale.x = -1
            if(player.vx>-10){
                player.vx-=1;
            }
         }else if(player.vx<0){
         player.vx+=1
         }
        if(pressing[KEY_RIGHT]){
            //Changing the image scale
            player.scale.x = 1
         if(player.vx<10){
             player.vx+=1;
         }
        }else if(player.vx>0){
         player.vx-=1
        }
         player.x+=player.vx    

         player.vy +=1;
         if(player.vy>15){
             player.vy=15;
         }
         if(onGround&&lastPress===KEY_UP){
             player.vy=-15;
         }else if(pressing[KEY_UP]){
             if(player.vy>5){
                player.vy-=1;
             }
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
             elapsed+=deltaTime
             if(elapsed>3600){
                 elapsed-=3600;
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
        canvas.width = 240;
        canvas.height= 160;

        player = new Rectangle2d(48,16,16,32,true);
        cam = new Camera();
        spritesheet.src = 'assets/platformer-sprites.png'
        // wall.push(new Rectangle2d(150,190,10,10,true));
        enableInput();
        setMap(map0,16);
        run()
        repaint()
}


    window.addEventListener('load',init,false)


}(window))