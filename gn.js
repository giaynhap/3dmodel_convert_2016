/* 
   -Author: Giấy Nháp
*/
var version=0;
var mesh_name = [];
var mesh_nvert = [];
var mesh_nidx  = [];
var mesh_tri  = [];
var mesh_ver_pos  = [];
var mesh_ver_normals  = [];
var mesh_ver_uvs  = [];
var mesh_weights  = [];
var mesh_weightsets  = [];
var mesh_weightsets_output = [];
var numWeight=0
var nummesh=0;
var totalmesh=0;
var bone_matdata=[];
var bone_position=[]
var bont_ct=[];
var bont_quats=[]
var bone_name=[];
var bone_nSubbone=[];
var numbone=0;
var bone_data_out =[];
var bone_par=[];
var bone_id=[];
var Matrix4x4s;
var numAnim=0;
var anim_name=[];
var anim_nkeyframe=[];
var anim_listkeyframe=[];
var anim_frame_pos=[];
var anim_frame_quats=[];

var  LTB_MESHTYPE_NOTSKINNED = 1;
var  LTB_MESHTYPE_EXTRAFLOAT = 2;
var  LTB_MESHTYPE_SKINNED = 4;
var  LTB_MESHTYPE_SKINNEDALT = 3;
var  LTB_MESHTYPE_TWOEXTRAFLOAT = 5;
function load_binary_resource(url) {
	var req = new XMLHttpRequest();
	req.open('GET', url, false);
	// The following line says we want to receive data as Binary and not as Unicode
	req.overrideMimeType('text/plain; charset=x-user-defined');
	req.send(null);
	if (req.status != 200) return '';
	return req.responseText;
}
function swap32(val) {
    return ((val & 0xFF) << 24)
           | ((val & 0xFF00) << 8)
           | ((val >> 8) & 0xFF00)
           | ((val >> 24) & 0xFF);
}
function swap16(val) {
    return ((val & 0xFF) << 8)
           | ((val >> 8) & 0xFF);
}
function humanize(x){
  return x.toFixed(6).replace(/\.?0*$/,'');
}

function Clac_Par_Bone()
{
	if (numbone<1) return 0;
	var nsubone = [];
	nsubone[0] = bone_nSubbone[0];
	bone_par[0] = -1;
	for (var i = 1; i < numbone; i++)
	{
		nsubone[i] =bone_nSubbone[i];
		for (var j = i - 1; j >= 0; j--)
			if (nsubone[j] > 0)
			{
				nsubone[j] -= 1;
				bone_par[i] = j;
				break;
			}
	}
}
function GetBoneWeightD( num,  size)
{
	var max = size[0];
	var boneWeight = num[1];
	if (num[0] > 3) num[0] = 3;
	for (var i = 1; i < num[0]; i++)
	{
		if (max < size[i])
		{
			max = size[i];
			boneWeight = num[i + 1];
		}
	}
	return boneWeight;
}

function calc_databone()
{
	Matrix4x4s=[];
	for (var i = 0; i < numbone; i++)
	{
		
		var Matrix4x4 = [];
		for (var k = 0; k < 4; k++)
		{
			Matrix4x4[k]=[];
			Matrix4x4[k][0] = bone_matdata[i][k][0];
			Matrix4x4[k][1] = bone_matdata[i][k][1];
			Matrix4x4[k][2] = bone_matdata[i][k][2];
			Matrix4x4[k][3] = bone_matdata[i][k][3];
			
		}
		Matrix4x4s[i]=Matrix4x4;
		
		var localMatrix = worldToLocalMatrix(Matrix4x4, bone_par[i], Matrix4x4s);
		var quaternion = [];
		var rotation = [];
		quaternion = GetRotation(localMatrix);

		rotation = quaternionToRotation(quaternion);
		//rotation = QuaternionToYawPitchRoll(quaternion);
		var position =[];
		position = GetPosition(localMatrix);
		bone_data_out[i] = position[0].toFixed(6) + " " + position[1].toFixed(6) + " " + position[2].toFixed(6) + " " + rotation[0].toFixed(6) + " " + rotation[1].toFixed(6) + " " + rotation[2].toFixed(6);

	}

}
function  UnpackFromInt16( intval)
{
	return intval * 1.0/16.0;
}

function Calc_weightsets()
{
	
	for (var i = 0; i < nummesh; i++)
	{
		mesh_weightsets_output[i] = [];
		if ( mesh_weightsets[i].length > 1)
		{
			var pWeightset = 0;
			for (var j = 0; j < mesh_weightsets[i].length; j++)
			{
				var intWeightSet = [];

				var num = 0;
				for (var n = 0; n < 4; n++)
				{
					if (mesh_weightsets[i][j][2 + n] > -1)
					{
						intWeightSet[n + 1] = mesh_weightsets[i][j][2 + n];
						num += 1;

					}
					else break;

				}
				intWeightSet[0] = num;

				for (var k = 0; k < mesh_weightsets[i][j][1]; k++)
				{
					var WeightsetSize = [];
					if (mesh_weights[i].length > 0)
					{
						WeightsetSize = mesh_weights[i][pWeightset];

						var outw = GetBoneWeightD(intWeightSet, WeightsetSize);
						mesh_weightsets_output[i][pWeightset]=outw;
					}
					else mesh_weightsets_output[i][pWeightset]=mesh_weightsets[i][j][2];

					pWeightset += 1;
						
				}
				
			}
			
		}
		else
		{
			
			for (var j = 0; j <mesh_nvert[i]; j++)
				mesh_weightsets_output[i][j] = mesh_weightsets[i][0][0];
		
		}
		
	}
	// weightsets_output
}

function ltb__parse_animation(gnFile)
{
	var nskipdata = swap32(gnFile.getUint32());
	var skipzie = 0; ;
	for (var k = 0; k < nskipdata; k++)
	{
		var numchar =  swap16(gnFile.getUint16());
        var name =gnFile.getString(numchar);
		skipzie = swap32(gnFile.getUint32());
		gnFile.seek(gnFile.tell()+skipzie * 4);
	}

	var CompAnim =swap16(gnFile.getUint16());
	var CompAnim2 = swap16(gnFile.getUint16());

	numAnim =swap16(gnFile.getUint16());

	var unk1= swap16(gnFile.getUint16());

	for (var i = 0; i < numAnim; i++)
	{
		// LtbfAnim[i].listkeyframe.Clear();
		

		anim_listkeyframe[i]=[];
		anim_frame_pos[i]=[];
		anim_frame_quats[i]=[];
		gnFile.seek(gnFile.tell()+ 3* 4);
		var numchar =  swap16(gnFile.getUint16());
        var name =gnFile.getString(numchar);
		anim_name[i] =name;
		gnFile.seek(gnFile.tell()+ 8);
		anim_nkeyframe[i] = swap32(gnFile.getUint32());
		for (var j = 0; j < anim_nkeyframe[i]; j++)
		{
		     	anim_listkeyframe[i][j]=swap32(gnFile.getUint32());
				numchar =  swap16(gnFile.getUint16());
			    name =gnFile.getString(numchar);

		}

		var nsup = swap16(gnFile.getUint16());
		console.log(nsup);
		var first = false;
		for (var k = 0; k < numbone; k++)
		{
			anim_frame_pos[i][k] =[];
			anim_frame_quats[i][k] =[];
			var ispos=0;
			var isquat=0;
			if (nsup != 0)
			{
				if (first == false)
				{
					first = true;
						gnFile.seek(gnFile.tell()-2);
				}

				var gframe_2;
				var gframe_1;
				gframe_1 = swap16(gnFile.getUint16());

				swap16(gnFile.getUint16());
				
				var p = [0.0,0.0,0.0];
				var q =  [0.0,0.0,0.0,0.0];
				
				for (var j = 0; j < gframe_1; j++)
				{
					
					p[0] = UnpackFromInt16(gnFile.getInt16(gnFile.tell(),1));
					p[1] = UnpackFromInt16(gnFile.getInt16(gnFile.tell(),1));
					p[2] = UnpackFromInt16(gnFile.getInt16(gnFile.tell(),1));
					anim_frame_pos[i][k][ispos++]=[p[0],p[1],p[2]];

				}
				if (gframe_1 < anim_nkeyframe[i])
					for (var j = gframe_1; j < anim_nkeyframe[i]; j++)
					{
						anim_frame_pos[i][k][ispos++]=[p[0],p[1],p[2]];
					}
				gframe_2 = swap16(gnFile.getUint16());
				swap16(gnFile.getUint16());
				for (var j = 0; j < gframe_2; j++)
				{
				
					q[0] =gnFile.getInt16(gnFile.tell(),1) / 32767.0;
					q[1] = gnFile.getInt16(gnFile.tell(),1) / 32767.0;
					q[2] = gnFile.getInt16(gnFile.tell(),1) / 32767.0;
					q[3] =gnFile.getInt16(gnFile.tell(),1) / 32767.0;
					anim_frame_quats[i][k][isquat++]=[q[0],q[1],q[2],q[3]];
				}
				if (gframe_2 <  anim_nkeyframe[i])
					for (var j = gframe_2; j < anim_nkeyframe[i]; j++)
					{
						anim_frame_quats[i][k][isquat++]=[q[0],q[1],q[2],q[3]];
					}

			}
			else
			{

				if (k >= 2)
				{
					gnFile.seek(gnFile.tell()+1);
				}
				
				var p = [0.0,0.0,0.0];
				var q =  [0.0,0.0,0.0,0.0];
				
				for (var j = 0; j <  anim_nkeyframe[i]; j++)
				{

					
					if (k == 0)
					{

						p[0] =  UnpackFromInt16(gnFile.getInt16(gnFile.tell(),1));
						gnFile.seek(gnFile.tell()+2);
						p[1] =  UnpackFromInt16(gnFile.getInt16(gnFile.tell(),1));
						gnFile.seek(gnFile.tell()+2);
						p[2] =  UnpackFromInt16(gnFile.getInt16(gnFile.tell(),1));
						gnFile.seek(gnFile.tell()+2);


					}
					else
					{

						p[0] = gnFile.getFloat32(gnFile.tell(),1);
						p[1] = gnFile.getFloat32(gnFile.tell(),1);
						p[2] = gnFile.getFloat32(gnFile.tell(),1);

					}

					anim_frame_pos[i][k][j]=[p[0],p[1],p[2]];

				}
				for (var j = 0; j < anim_nkeyframe[i]; j++)
				{
				
					if (k == 0)
					{
						q[0] = gnFile.getInt16(gnFile.tell(),1) / -32767.0;
						gnFile.seek(gnFile.tell()+2);
						q[1] = gnFile.getInt16(gnFile.tell(),1) / -32767.0;
						gnFile.seek(gnFile.tell()+2);
						q[2] = gnFile.getInt16(gnFile.tell(),1) / -32767.0;
						gnFile.seek(gnFile.tell()+2);
						q[3] = gnFile.getInt16(gnFile.tell(),1) / -32767.0;
						gnFile.seek(gnFile.tell()+2);
					}
					else
					{
						q[0] =  gnFile.getFloat32(gnFile.tell(),1);
						q[1] = gnFile.getFloat32(gnFile.tell(),1);
						q[2] =  gnFile.getFloat32(gnFile.tell(),1);
						q[3] = gnFile.getFloat32(gnFile.tell(),1);
					}
					anim_frame_quats[i][k][j]=[q[0],q[1],q[2],q[3]];
				 
				}
			}
		}
	}


}

function ltb__parse_vertices(gnFile,numVerts,meshType,imesh)
{
    if (meshType == 3)
    {
	     meshType = LTB_MESHTYPE_TWOEXTRAFLOAT;
    }
	var IncludeWeights =1;
    if (meshType == LTB_MESHTYPE_NOTSKINNED)
	{
		IncludeWeights = 0;
	}
	mesh_ver_pos[imesh]=[];

	mesh_ver_normals[imesh]=[];

	mesh_ver_uvs[imesh]=[];
	mesh_weights[imesh]=[]
	for (var i = 0; i < numVerts; i++)
    {
    mesh_ver_pos[imesh][i*3]=gnFile.getFloat32(gnFile.tell(),1);
	mesh_ver_pos[imesh][i*3+1]=gnFile.getFloat32(gnFile.tell(),1);
	mesh_ver_pos[imesh][i*3+2]=gnFile.getFloat32(gnFile.tell(),1);
 
	 if (IncludeWeights)
		{
			var f1=0.0,f2=0.0,f3=0.0;
			f1=gnFile.getFloat32(gnFile.tell(),1);
			if (meshType != LTB_MESHTYPE_EXTRAFLOAT) f2=gnFile.getFloat32(gnFile.tell(),1);
			else f2=1.0-f1;
			
			if (meshType != LTB_MESHTYPE_TWOEXTRAFLOAT && meshType != LTB_MESHTYPE_EXTRAFLOAT) f3=gnFile.getFloat32(gnFile.tell(),1);
			else f3 = 1.0-(f1+f2);
			mesh_weights[imesh][i]=[f1,f2,f3];
		}
	mesh_ver_normals[imesh][i*3]=gnFile.getFloat32(gnFile.tell(),1);
	mesh_ver_normals[imesh][i*3+1]=gnFile.getFloat32(gnFile.tell(),1);
	mesh_ver_normals[imesh][i*3+2]=gnFile.getFloat32(gnFile.tell(),1);
	mesh_ver_uvs[imesh][i*2]=gnFile.getFloat32(gnFile.tell(),1);
	mesh_ver_uvs[imesh][i*2+1]=gnFile.getFloat32(gnFile.tell(),1);
	mesh_ver_uvs[imesh][i*2+1]=1.0-mesh_ver_uvs[imesh][i*2+1];
	if (mesh_ver_uvs[imesh][i*2]>1.0) {mesh_ver_uvs[imesh][i*2]-=1.0;}
	
	}
}
function ltb__parse_skeleton(gnFile)
{
	for (var n = 0; n < numbone; n++)
	{
		bone_matdata[n]=[]
		var numchar =  swap16(gnFile.getUint16());
        var name =gnFile.getString(numchar);
		bone_name[n] = name;
		gnFile.seek(gnFile.tell()+3);
		for (var i = 0; i < 4; i++)
		{
			bone_matdata[n][i]=[]
			for (var j = 0; j < 4; j++)
			{
				bone_matdata[n][i][j] = gnFile.getFloat32(gnFile.tell(),1);
			}
		}
		bone_nSubbone[n]= swap32(gnFile.getUint32());
	}
	 Clac_Par_Bone();
}
		
function ltb__parse_submesh(gnFile,numSubmesh,name)
{
    for (var i = 0; i < numSubmesh; i++)
    {
		var imesh = totalmesh
		mesh_name[imesh]= name + "_" + i;
		gnFile.seek(gnFile.tell()+25);
		var unk1 =  swap32(gnFile.getUint32());
		var sectionSize =  gnFile.getUint32(gnFile.tell(),1);
	
		if (sectionSize != 0)
		 {
			var start = gnFile.tell();
		    var numVerts = swap32(gnFile.getUint32());
			var numIdx = swap32(gnFile.getUint32())*3;
			var meshType = swap32(gnFile.getUint32());
		    mesh_nvert[imesh]=numVerts;
		    mesh_nidx[imesh]=numIdx;
		    gnFile.seek(gnFile.tell()+20);
			mesh_weightsets[imesh]=[];
			var a=0;
			if (unk1 == 4)
		    {
				mesh_weightsets[imesh][0]=[];
				mesh_weightsets[imesh][0][0]= swap32(gnFile.getUint32());
			  // gnFile.seek(gnFile.tell()+4);
		    }
			if (unk1 == 5)
			  a= swap16(gnFile.getUint16());
		  
			ltb__parse_vertices(gnFile,numVerts,meshType,imesh)	;
			mesh_tri[imesh]=[];
			for (var j = 0; j < numIdx; j++)
			{
				mesh_tri[imesh][j]= swap16(gnFile.getUint16());
					//console.log(mesh_tri[imesh][j])
			}
			  if (unk1 == 5)
			{
				 numWeight =  swap32(gnFile.getUint32());
				
				for (var j = 0;j < numWeight; j++)
				{
					mesh_weightsets[imesh][j]=[];
					mesh_weightsets[imesh][j]=[swap16(gnFile.getUint16()),swap16(gnFile.getUint16()),gnFile.getUint8(),gnFile.getUint8(),gnFile.getUint8(),gnFile.getUint8(),swap32(gnFile.getUint32())];
				//	 gnFile.seek(gnFile.tell()+12);
				}
			}
			else numWeight=1;
			var unk2 = gnFile.getUint8();
           gnFile.seek(gnFile.tell()+unk2);
		   
            
			
		 }
		 totalmesh+=1;
	}
}
function ltb__parse_mesh(gnFile)
{
	for (var i=0;i<nummesh;i++)
	{
	   var numchar =  swap16(gnFile.getUint16());
		
        var name =gnFile.getString(numchar);
		var numSubmesh = swap32(gnFile.getUint32());
		for (var j = 0; j < numSubmesh; j++)
		{
		   gnFile.getFloat32();
		}
		gnFile.seek(gnFile.tell()+8);
		ltb__parse_submesh(gnFile,numSubmesh,name);
	}
	 Calc_weightsets();
}

function __read_header_LTB(data) {
		__reset_data();
		var gnFile = new jDataView(data);
		var gflength =gnFile.getLength();
		gnFile.seek(32);
        numbone = swap32(gnFile.getUint32());
        gnFile.seek(gnFile.tell()+48);
	    var numchar =  swap16(gnFile.getUint16());
		gnFile.getString(numchar);
		gnFile.seek(gnFile.tell()+8);
		nummesh =  swap32(gnFile.getUint32());	
	    ltb__parse_mesh(gnFile);
		nummesh =totalmesh;
		ltb__parse_skeleton(gnFile);
		calc_databone();
		if (gflength -  gnFile.tell()> 2048) 
		{
		  console.log("isAnim=True");
		  ltb__parse_animation(gnFile);
		  ctrl_anim_list= __dislay(ctrl_anim_list);
		}
		else console.log("isAnim=False");
}
function __reset_data()
{
		 version =0;
		 mesh_name = [];
		 mesh_nvert = [];
		 mesh_nidx  = [];
		 mesh_tri  = [];
		 mesh_ver_pos  = [];
		 mesh_ver_normals  = [];
		 mesh_ver_uvs  = [];
		 nummesh=0;
		 totalmesh=0;
		 mesh_weights  = [];
		 mesh_weightsets  = [];
		 mesh_weightsets_output = [];
		 numWeight=0
		 bone_matdata=[];
		 bone_name=[];
		 bone_nSubbone=[];
		 bone_par=[];
		 numbone=0;
		 bone_data_out =[];
		 numAnim=0;
		 anim_name=[];
		 anim_nkeyframe=[];
		 anim_listkeyframe=[];
		 anim_frame_pos=[];
		 anim_frame_quats=[];
		 bone_id=[];
		 bone_position=[]
		 bont_ct=[];
		 bont_quats=[]
	
}