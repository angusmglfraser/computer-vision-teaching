!function(t){var e={};function r(a){if(e[a])return e[a].exports;var n=e[a]={i:a,l:!1,exports:{}};return t[a].call(n.exports,n,n.exports,r),n.l=!0,n.exports}r.m=t,r.c=e,r.d=function(t,e,a){r.o(t,e)||Object.defineProperty(t,e,{configurable:!1,enumerable:!0,get:a})},r.r=function(t){Object.defineProperty(t,"__esModule",{value:!0})},r.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="",r(r.s=6)}([function(t,e,r){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var a=r(2);e.RGBImage=a.RGBImage;var n,i=r(1);function o(t,e,r,n){for(var i=t.getWidth(),o=t.getHeight(),h=a.RGBImage.fromDimensions(i,o),g=Math.floor(r/2),s=Math.floor(n/2),u=0;u<i;u++)for(var f=0;f<o;f++){for(var d=0,c=0;c<r;c++)for(var l=0;l<n;l++)d+=e[c][l]*t.r[Math.abs(u+g-c)%i][Math.abs(f+s-l)%o];h.r[u][f]=h.g[u][f]=h.b[u][f]=d}return h}function h(t,e){for(var r=a.RGBImage.fromDimensions(t.getWidth(),t.getHeight()),n=a.RGBImage.fromDimensions(t.getWidth(),t.getHeight()),i=Math.floor(e.length/2),o=0;o<t.getWidth();o++)for(var h=0;h<t.getHeight();h++){for(var g=0,s=0,u=0,f=0;f<e.length;f++)g+=e[f]*t.r[Math.abs(o+i-f)%t.getWidth()][h],s+=e[f]*t.g[Math.abs(o+i-f)%t.getWidth()][h],u+=e[f]*t.b[Math.abs(o+i-f)%t.getWidth()][h];n.r[o][h]=Math.abs(g),n.g[o][h]=Math.abs(s),n.b[o][h]=Math.abs(u)}for(o=0;o<t.getWidth();o++)for(h=0;h<t.getHeight();h++){for(g=0,s=0,u=0,f=0;f<e.length;f++)g+=e[f]*n.r[o][Math.abs(h+i-f)%t.getHeight()],s+=e[f]*n.g[o][Math.abs(h+i-f)%t.getHeight()],u+=e[f]*n.b[o][Math.abs(h+i-f)%t.getHeight()];r.r[o][h]=Math.abs(g),r.g[o][h]=Math.abs(s),r.b[o][h]=Math.abs(u)}return r}function g(t,e){for(var r=t.getWidth(),n=t.getHeight(),i=a.RGBImage.fromDimensions(r,n),o=0;o<r;o++)for(var h=0;h<r;h++){var g=t.r[o][h],s=e.r[o][h],u=t.g[o][h],f=e.g[o][h],d=t.b[o][h],c=e.b[o][h];i.r[o][h]=Math.floor(Math.sqrt(g*g+s*s)),i.g[o][h]=Math.floor(Math.sqrt(u*u+f*f)),i.b[o][h]=Math.floor(Math.sqrt(d*d+c*c))}return i}e.MovingAverageBackgroundSubtractor=i.MovingAverageBackgroundSubtractor,e.gaussKernel=[[1/273,4/273,7/273,4/273,1/273],[4/273,16/273,26/273,16/273,4/273],[7/273,26/273,41/273,26/273,7/273],[4/273,16/273,26/273,16/273,4/273],[1/273,4/273,7/273,4/273,1/273]],e.gauss1d=[.06136,.24477,.38774,.24477,.06136],e.sobelX=[[1,0,-1],[2,0,-2],[1,0,-1]],e.sobelY=[[1,2,1],[0,0,0],[-1,-2,-1]],function(t){t[t.NO_EDGE=0]="NO_EDGE",t[t.WEAK_EDGE=1]="WEAK_EDGE",t[t.STRONG_EDGE=2]="STRONG_EDGE"}(n||(n={})),e.getImageFromCanvas=function(t){return a.RGBImage.fromImageData(t.getContext("2d").getImageData(0,0,t.width,t.height))},e.getImageFromVideo=function(t,e,r){void 0===r&&(r=1);var n=t.videoWidth*r,i=t.videoHeight*r;return e.getContext("2d").drawImage(t,0,0,n,i),a.RGBImage.fromImageData(e.getContext("2d").getImageData(0,0,n,i))},e.convolve=function(t,e,r,n){for(var i=t.getWidth(),o=t.getHeight(),h=a.RGBImage.fromDimensions(i,o),g=Math.floor(r/2),s=Math.floor(n/2),u=0;u<t.getWidth();u++)for(var f=0;f<t.getHeight();f++){for(var d=0,c=0,l=0,v=0;v<r;v++)for(var b=0;b<n;b++)d+=e[v][b]*t.r[Math.abs(u+g-v)%i][Math.abs(f+s-b)%o],c+=e[v][b]*t.g[Math.abs(u+g-v)%i][Math.abs(f+s-b)%o],l+=e[v][b]*t.b[Math.abs(u+g-v)%i][Math.abs(f+s-b)%o];h.r[u][f]=d,h.g[u][f]=c,h.b[u][f]=l}return h},e.greyscaleConvolve=o,e.convolve1d=h,e.combineConvolutions=g,e.initCamera=function(){navigator.mediaDevices.getUserMedia({video:!0}).then(function(t){var e=document.getElementById("webcam");e.srcObject=t,e.addEventListener("playing",function(t){for(var r=document.getElementsByTagName("canvas"),a=0;a<r.length;a++)r[a].width=e.videoWidth,r[a].height=e.videoHeight})}).catch(function(t){var e=t.name,r=e;switch(e){case"NotSupportedError":r+="\nIf you are using Google Chrome, try changing the 'http' at the start of the url to 'https', or using a different web browser, such as Firefox";break;case"NotReadableError":r+="\nPlease make sure that your webcam is connected and enabled, and not currently being used by another application.";break;case"NotAllowedError":return}alert(r)})},e.getForeground=function(t,e,r){e=e.greyScale();for(var n=t.greyScale(),i=a.RGBImage.fromDimensions(t.getWidth(),t.getHeight()),o=0;o<t.getWidth();o++)for(var h=0;h<t.getHeight();h++)Math.abs(n.r[o][h]-e.r[o][h])>r&&(i.r[o][h]=t.r[o][h],i.g[o][h]=t.g[o][h],i.b[o][h]=t.b[o][h]);return i},e.getBackground=function(t,e,r){e=e.greyScale();for(var n=t.greyScale(),i=a.RGBImage.fromDimensions(t.getWidth(),t.getHeight()),o=0;o<t.getWidth();o++)for(var h=0;h<t.getHeight();h++)Math.abs(n.r[o][h]-e.r[o][h])<r&&(i.r[o][h]=t.r[o][h],i.g[o][h]=t.g[o][h],i.b[o][h]=t.b[o][h]);return i},e.imageDiff=function(t,e){for(var r=a.RGBImage.fromDimensions(e.getWidth(),e.getHeight()),n=0;n<e.getWidth();n++)for(var i=0;i<e.getHeight();i++){var o=Math.abs(e.r[n][i]-t.r[n][i]),h=Math.abs(e.g[n][i]-t.g[n][i]),g=Math.abs(e.b[n][i]-t.b[n][i]);r.r[n][i]=o,r.g[n][i]=h,r.b[n][i]=g}return r},e.getCannyEdges=function(t,r,i){var s=h(t=t.greyScale(),e.gauss1d),u=o(s,e.sobelX,3,3),f=o(s,e.sobelY,3,3);return function(t){for(var e=t.length,r=t[0].length,i=a.RGBImage.fromDimensions(e,r),o=0;o<e;o++)for(var h=0;h<r;h++)switch(t[o][h]){case n.STRONG_EDGE:i.r[o][h]=i.g[o][h]=i.b[o][h]=255;break;case n.WEAK_EDGE:for(var g=!1,s=0,u=o-1;u<=o+1;u++){for(var f=h-1;f<=h+1;f++)if(t[Math.abs(u)%e][Math.abs(f)%r]===n.STRONG_EDGE){g=!0,s=255;break}if(g)break}i.r[o][h]=i.g[o][h]=i.b[o][h]=s;break;default:i.r[o][h]=i.g[o][h]=i.b[o][h]=0}return i}(function(t,e,r){for(var a=new Array(t.getWidth()),i=Math.max(e,r),o=Math.min(e,r),h=0;h<t.getWidth();h++){a[h]=new Array(t.getHeight());for(var g=0;g<t.getHeight();g++)t.r[h][g]>i?a[h][g]=n.STRONG_EDGE:t.r[h][g]>o?a[h][g]=n.WEAK_EDGE:a[h][g]=n.NO_EDGE}return a}(function(t,e){for(var r=a.RGBImage.fromDimensions(t.getWidth(),t.getHeight()),n=0;n<t.getWidth();n++)for(var i=0;i<t.getHeight();i++){var o=e[n][i];o<22.5?t.r[n][i]==Math.max(t.r[(n+1)%t.getWidth()][i],t.r[Math.abs(n-1)][i],t.r[n][i])?r.r[n][i]=r.g[n][i]=r.b[n][i]=t.r[n][i]:r.r[n][i]=r.g[n][i]=r.b[n][i]=0:o<67.5?t.r[n][i]==Math.max(t.r[n][i],t.r[(n+1)%t.getWidth()][(i+1)%t.getHeight()],t.r[Math.abs(n-1)][Math.abs(i-1)])||t.r[n][i]==Math.max(t.r[n][i],t.r[(n+1)%t.getWidth()][Math.abs(i-1)],t.r[Math.abs(n-1)][(i+1)%t.getHeight()])?r.r[n][i]=r.g[n][i]=r.b[n][i]=t.r[n][i]:r.r[n][i]=r.g[n][i]=r.b[n][i]=0:t.r[n][i]==Math.max(t.r[n][(i+1)%t.getHeight()],t.r[n][Math.abs(i-1)],t.r[n][i])?r.r[n][i]=r.g[n][i]=r.b[n][i]=t.r[n][i]:r.r[n][i]=r.g[n][i]=r.b[n][i]=0}return r}(g(u,f),function(t,e){for(var r=new Array(t.getWidth()),a=0;a<t.getWidth();a++){r[a]=new Array(t.getHeight());for(var n=0;n<t.getHeight();n++){var i=180*Math.atan2(t.r[a][n],e.r[a][n])/Math.PI;r[a][n]=i}}return r}(u,f)),r,i))}},function(t,e,r){"use strict";var a=this&&this.__importStar||function(t){if(t&&t.__esModule)return t;var e={};if(null!=t)for(var r in t)Object.hasOwnProperty.call(t,r)&&(e[r]=t[r]);return e.default=t,e};Object.defineProperty(e,"__esModule",{value:!0});var n=a(r(0)),i=function(){function t(t){this.buffer=new h,this.capacity=t,this.currentBackground=null}return t.prototype.addFrame=function(t){var e=this.buffer.getSize();if(null==this.currentBackground)this.currentBackground=t,this.buffer.add(t);else{var r=void 0;if(this.buffer.getSize()<this.capacity){r=n.RGBImage.clone(this.currentBackground);for(var a=0;a<t.getWidth();a++)for(var i=0;i<t.getHeight();i++)r.r[a][i]*=e,r.g[a][i]*=e,r.b[a][i]*=e,r.r[a][i]+=t.r[a][i],r.g[a][i]+=t.g[a][i],r.b[a][i]+=t.b[a][i]}else{r=n.RGBImage.clone(this.currentBackground);var o=this.buffer.removeFirstNode();for(a=0;a<t.getWidth();a++)for(i=0;i<t.getHeight();i++)r.r[a][i]*=e,r.g[a][i]*=e,r.b[a][i]*=e,r.r[a][i]-=o.r[a][i],r.g[a][i]-=o.g[a][i],r.b[a][i]-=o.b[a][i],r.r[a][i]+=t.r[a][i],r.g[a][i]+=t.g[a][i],r.b[a][i]+=t.b[a][i]}this.buffer.add(t);for(a=0;a<t.getWidth();a++)for(i=0;i<t.getHeight();i++)r.r[a][i]/=this.buffer.getSize(),r.g[a][i]/=this.buffer.getSize(),r.b[a][i]/=this.buffer.getSize();this.currentBackground=r}},t.prototype.getBackgroundModel=function(){return this.currentBackground},t.prototype.setBufferSize=function(t){if(t>this.buffer.getSize())this.capacity=t;else{for(this.capacity=t;this.buffer.getSize()>this.capacity;)this.buffer.removeFirstNode();this.recalculateBackgroundModel()}},t.prototype.recalculateBackgroundModel=function(){for(var t=new o(this.buffer),e=n.RGBImage.fromDimensions(this.currentBackground.getWidth(),this.currentBackground.getHeight());t.hasNext();)for(var r=t.next(),a=0;a<this.currentBackground.getWidth();a++)for(var i=0;i<this.currentBackground.getHeight();i++)e.r[a][i]+=r.r[a][i],e.g[a][i]+=r.g[a][i],e.b[a][i]+=r.b[a][i];for(a=0;a<this.currentBackground.getWidth();a++)for(i=0;i<this.currentBackground.getHeight();i++)e.r[a][i]=e.r[a][i]/this.buffer.getSize(),e.g[a][i]=e.g[a][i]/this.buffer.getSize(),e.b[a][i]=e.b[a][i]/this.buffer.getSize()},t}();e.MovingAverageBackgroundSubtractor=i;var o=function(){function t(t){this.currentNode=t.getFirstNode()}return t.prototype.hasNext=function(){return null!=this.currentNode.next&&void 0!=this.currentNode.next},t.prototype.next=function(){var t=this.currentNode.data;return this.currentNode=this.currentNode.next,t},t}(),h=function(){function t(){this.size=0}return t.prototype.add=function(t){0==this.size?(this.first=new g(t),this.last=this.first):(this.last.next=new g(t),this.last.next.previous=this.last,this.last=this.last.next),this.size++},t.prototype.removeFirstNode=function(){var t=this.first.data;return this.first=this.first.next,this.first.previous.next=null,this.first.previous=null,this.size--,t},t.prototype.removeLastNode=function(){var t=this.last.data;return this.last=this.last.previous,this.last.next.previous=null,this.last.next=null,this.size--,t},t.prototype.getFirstNode=function(){return this.first},t.prototype.getLastNode=function(){return this.last},t.prototype.getSize=function(){return this.size},t}(),g=function(){return function(t){this.data=t,this.previous=null,this.next=null}}()},function(t,e,r){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var a=function(){function t(){}return t.getIndex=function(t,e,r,a){return r*e+t},t.fromDimensions=function(e,r){var a=new t;a.width=e,a.height=r,a.r=new Array(e),a.g=new Array(e),a.b=new Array(r);for(var n=0;n<e;n++)a.r[n]=new Array(r),a.g[n]=new Array(r),a.b[n]=new Array(r);return a},t.fromImageData=function(e){var r=new t;r.width=e.width,r.height=e.height,r.r=new Array(r.width),r.g=new Array(r.width),r.b=new Array(r.width);for(var a=0;a<r.width;a++){r.r[a]=new Array(r.height),r.g[a]=new Array(r.height),r.b[a]=new Array(r.height);for(var n=0;n<r.height;n++){var i=4*t.getIndex(a,n,r.width,r.height);r.r[a][n]=e.data[i++],r.g[a][n]=e.data[i++],r.b[a][n]=e.data[i]}}return r},t.clone=function(e){var r=new t;r.width=e.width,r.height=e.height,r.r=new Array(r.width),r.g=new Array(r.width),r.b=new Array(r.width);for(var a=0;a<r.width;a++){r.r[a]=new Array(r.height),r.g[a]=new Array(r.height),r.b[a]=new Array(r.height);for(var n=0;n<r.height;n++)r.r[a][n]=e.r[a][n],r.g[a][n]=e.g[a][n],r.b[a][n]=e.b[a][n]}return r},t.prototype.getWidth=function(){return this.width},t.prototype.getHeight=function(){return this.height},t.prototype.asImageData=function(){for(var e=new ImageData(this.width,this.height),r=0;r<this.width;r++)for(var a=0;a<this.height;a++){var n=4*t.getIndex(r,a,this.width,this.height);e.data[n++]=this.r[r][a],e.data[n++]=this.g[r][a],e.data[n++]=this.b[r][a],e.data[n]=255}return e},t.prototype.draw=function(t){var e=this.asImageData();t.getContext("2d").putImageData(e,0,0)},t.prototype.greyScale=function(){for(var e=t.fromDimensions(this.width,this.height),r=0;r<e.width;r++)for(var a=0;a<e.height;a++){var n=(this.r[r][a]+this.g[r][a]+this.b[r][a])/3;e.r[r][a]=e.g[r][a]=e.b[r][a]=n}return e},t}();e.RGBImage=a},,,,function(t,e,r){"use strict";var a=this&&this.__importStar||function(t){if(t&&t.__esModule)return t;var e={};if(null!=t)for(var r in t)Object.hasOwnProperty.call(t,r)&&(e[r]=t[r]);return e.default=t,e};Object.defineProperty(e,"__esModule",{value:!0});var n,i=a(r(0)),o=!1,h=+document.getElementById("stdDev").value,g=+document.getElementById("kernelSize").value;function s(t,e){for(var r=new Array(t),a=0,n=Math.floor(t/2),i=0-n;i<=n;i++)a+=r[i+n]=1/Math.sqrt(2*Math.PI*e*e)*Math.pow(Math.E,0-i*i/(2*e*e));for(i=0;i<t;i++)r[i]=r[i]/a;return r}function u(t){for(var e=new Array(t.length),r=0;r<t.length;r++){e[r]=new Array(t.length);for(var a=0;a<t.length;a++)e[r][a]=t[r]*t[a]}return e}function f(t){for(var e=document.getElementById("matrix"),r="\\( \\begin{bmatrix} ",a=0;a<t.length;a++){for(var n=0;n<t[a].length-1;n++)r+=t[n][a]+" & ";r+=t[t.length-1][a]+" \\\\ "}r+="\\end{bmatrix} \\)",e.innerHTML=r,MathJax.Hub.Typeset()}function d(){var t=i.getImageFromVideo(document.getElementById("webcam"),document.getElementById("camfeed"));i.convolve1d(t,n).draw(document.getElementById("convolutionout")),o&&requestAnimationFrame(d)}document.getElementById("startBtn").addEventListener("click",function(t){o=!0,d()}),document.getElementById("stopBtn").addEventListener("click",function(t){o=!1}),document.getElementById("kernelSize").addEventListener("change",function(t){var e=+this.value;NaN!=e&&e>0&&(0|e)===e&&e%2==1&&(n=s(g=+e,h),f(u(n)))}),document.getElementById("stdDev").addEventListener("change",function(t){var e=this.value;NaN!=+e&&(h=+e),n=s(g,h),f(u(n))}),i.initCamera(),n=s(g,h),f(u(n))}]);
//# sourceMappingURL=gauss.js.map