import {resolveModel} from './model-tools.mjs';
export const architecturalRanges={0:[400,600],1:[600,900],2:[700,900],3:[1050,1200]};
export function catalogADU(p,variant=0){
 const n=p.beds,W=n===3?34:20,D=p.area/W,iw=5/12,front=n?11:D-7.5,band=front+7,top=band+iw,walls=[],doors=[],windows=[],fixtures=[],rooms=[];
 const wall=(id,x1,y1,x2,y2,thickness=iw)=>walls.push({id,x1,y1,x2,y2,thickness,height:9});
 const door=(id,wallId,start,width,from,to,kind='hinged')=>doors.push({id,wallId,start,width,from,to,kind,swing:1,height:6.833});
 const win=(id,wallId,start,width)=>windows.push({id,wallId,start,width,sill:3,height:4});
 const room=(id,name,x,y,w,d)=>rooms.push({id,name,x,y,w,d});
 const f=(id,name,x,y,w,d,h=2.75)=>fixtures.push({id,name,x,y,w,d,z:0,h});
 wall('south',0,.25,W,.25,.5);wall('east',W-.25,.25,W-.25,D-.25,.5);wall('north',0,D-.25,W,D-.25,.5);wall('west',.25,.25,.25,D-.25,.5);
 wall('public',.5,front+iw/2,W-.5,front+iw/2);wall('bath',8+iw/2,front+iw,8+iw/2,n?band:D-.5);
 door('entry','south',n?W-4:9,3,'outside','living');door('hall-opening','public',9,3.5,'living','hall','open');door('bath-door','bath',1,2.5,'hall','bath');
 win('living-window','south',3,5);win('kitchen-window','west',2,4);win('bath-window','west',front+1,2);
 room('living',n?'Living / kitchen':'Studio / living / kitchen',.5,.5,W-1,front-.5);room('bath','Bathroom',.5,front+iw,7.5,(n?band:D-.5)-front-iw);room('hall','Hall / laundry',8+iw,front+iw,W-8.5-iw,(n?band:D-.5)-front-iw);
 f('counter','Kitchen base cabinets',.5,1.5,2,7);f('sink','Kitchen sink',.5,3.5,2,2);f('range','Range',.5,6,2,2.5);f('fridge','Refrigerator',3,8,2.5,2.5,6.5);f('sofa','Sofa',W-8,8,6,2.5,2.3);f('dining','Table',6,3,3,2.5,2.5);
 const end=n?band:D-.5;f('tub','Tub / shower',.5,end-2.5,5,2.5,1.6);f('wc','Toilet',6,end-2.5,1.6,2.5,1.5);f('vanity','Vanity / basin',.7,front+iw+.1,3,1.75);f('laundry','Stacked laundry',W-3,front+iw+.2,2.5,2.5,6.5);
 if(n){wall('sleep',.5,band+iw/2,W-.5,band+iw/2);const rw=(W-1-(n-1)*iw)/n;for(let i=0;i<n;i++){const x=.5+i*(rw+iw),id='bed'+(i+1);room(id,'Bedroom '+(i+1),x,top,rw,D-.5-top);if(i)wall('split'+i,x-iw/2,top,x-iw/2,D-.5);door(id+'-door','sleep',x+rw-3.2-.5,2.667,'hall',id);win(id+'-window','north',x+1.5,4);wall(id+'-closet',x,top+2+iw/2,x+4.5,top+2+iw/2);wall(id+'-closet-side',x+4.5+iw/2,top,x+4.5+iw/2,top+2+iw);door(id+'-closet-door',id+'-closet',.2,4,id,id+'-closet','sliding');f(id+'-closet','Closet',x,top,4.5,2,7);f(id,'Queen bed',x+2,D-7.5,5,6.667,1.8);}}
 else f('studio-bed','Studio bed',13,.75,5,6.667,1.8);
 if(variant%2){for(const w of walls){w.x1=W-w.x1;w.x2=W-w.x2;}for(const r of [...rooms,...fixtures])r.x=W-r.x-r.w;for(const o of doors)o.swing*=-1;}
 return resolveModel({variant,width:W,depth:D,area:p.area,parameters:p,walls,doors,windows,fixtures,rooms,units:'feet',modelVersion:3,architecture:true,wallHeight:9,scope:'Architectural concept; not permit ready. Professional architectural, engineering and code review required.'});
}
