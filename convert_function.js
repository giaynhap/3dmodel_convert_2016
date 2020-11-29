/* 
   -Author: Giấy Nháp
*/
function show_anim(indexanim)
{

	var gtext="version 1\nnodes\n";
	for (var i = 0; i < numbone; i++)
	{
		gtext+=i + " \"" + bone_name[i] + "\" " + bone_par[i] + "\n";
	}
	gtext+="end\nskeleton\n";
	for (var i = 0; i < anim_nkeyframe[indexanim]; i++)
    {
		var giTime = anim_listkeyframe[indexanim][i];
		gtext+="time " + giTime + "\n"
		for (var k = 0; k < numbone; k++)
        {
		    var quaternion = [anim_frame_quats[indexanim][k][i][0], anim_frame_quats[indexanim][k][i][1], anim_frame_quats[indexanim][k][i][2], anim_frame_quats[indexanim][k][i][3]];
			var rotation = quaternionToRotation(quaternion);
			var position = [];
			position[0] = anim_frame_pos[indexanim][k][i][0];
			position[1] = anim_frame_pos[indexanim][k][i][1];
			position[2] = anim_frame_pos[indexanim][k][i][2];
			gtext+=k + "   " + position[0].toFixed(6) + " " + position[1].toFixed(6) + " " + position[2].toFixed(6) + " " + rotation[0].toFixed(6) + " " + rotation[1].toFixed(6) + " " + rotation[2].toFixed(6) + "\n"
					
		}
	}
	gtext+="end";
	download(anim_name[indexanim]+".smd", gtext) 
}
function download(filename, text) {
var element = document.createElement('a');
element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
element.setAttribute('download', filename);

element.style.display = 'none';
document.body.appendChild(element);
var data=[];
  
 data.push(text);

properties = {type: 'plain/text'}; // Specify the file's mime-type.
try {
  // Specify the filename using the File constructor, but ...
  file = new File(data, filename, properties);
} catch (e) {
  // ... fall back to the Blob constructor if that isn't supported.
  file = new Blob(data, properties);
}
url = URL.createObjectURL(file);
element.href = url;
element.click();

document.body.removeChild(element);
}

function CREATE_DATA_SMD()
{

var gtext="version 1\nnodes\n";
if (numbone>0)
{
	for (var i = 0; i < numbone; i++)
	{
		gtext+=i + " \"" + bone_name[i] + "\" " + bone_par[i] + "\n";
	}
	gtext+="end\n\nskeleton\ntime 0\n";
	
	for (var i = 0; i < numbone; i++)
	{
		gtext+= i + "  " + bone_data_out[i] + "\n";
	}
	gtext+="end\ntriangles\n";
	
}
else
	gtext+= "0 \"root\" -1\nend\n\nskeleton\ntime 0\n 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000\nend\ntriangles\n"
for (var i=0;i<totalmesh;i++)

	for (var j=0;j<mesh_nidx[i];j+=3)
	{
		
		gtext+=mesh_name[i]+".bmp\n"
		for (var k=0;k<3;k++)
		{
			var g_a = 0;
		
			gtri = mesh_tri[i][j+k];
			if (numbone>0) g_a = mesh_weightsets_output[i][gtri];
			gtext+=g_a+" " +mesh_ver_pos[i][gtri*3].toFixed(6)+" "+mesh_ver_pos[i][gtri*3+1].toFixed(6)+" "+mesh_ver_pos[i][gtri*3+2].toFixed(6);
			gtext+=" "+mesh_ver_normals[i][gtri*3].toFixed(6)+" "+mesh_ver_normals[i][gtri*3+1].toFixed(6)+" "+mesh_ver_normals[i][gtri*3+2].toFixed(6);
			//if (mesh_ver_uvs[i][gtri*2]>1.0) mesh_ver_uvs[i][gtri*2]-=1.0;
			
			gtext+=" "+mesh_ver_uvs[i][gtri*2].toFixed(6)+" "+mesh_ver_uvs[i][gtri*2+1].toFixed(6);
			gtext+="\n";
		}
		
	}
gtext+="end";
return gtext;
}
