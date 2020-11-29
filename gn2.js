/* 
   -Author: Giấy Nháp
*/
function clac_vec( vector_1,  vector_2)
{
	var normal=[] ;
	normal[0] = vector_1[1]*vector_2[2]-vector_1[2]*vector_2[1];
	normal[1] = vector_1[2]*vector_2[0]-vector_1[0]*vector_2[2];
	normal[2] = vector_1[0]*vector_2[1]-vector_1[1]*vector_2[0];
	var lenght = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1] + normal[2] * normal[2]);
	normal[0] /= lenght ; normal[1] /= lenght ; normal[2] /= lenght ;
	
	return normal;
}
function calc_normalvector(mesh)
{
	for (var j = 0; j < mesh_nidx[mesh]; j+=3)
	{
		var tr = [ mesh_tri[mesh][j], mesh_tri[mesh][j+1], mesh_tri[mesh][j+2] ];

		var vert_0 = [mesh_ver_pos[mesh][tr[0]*3],mesh_ver_pos[mesh][tr[0]*3+1],mesh_ver_pos[mesh][tr[0]*3+2]];
		var vert_1 = [mesh_ver_pos[mesh][tr[1]*3],mesh_ver_pos[mesh][tr[1]*3+1],mesh_ver_pos[mesh][tr[1]*3+2]];
		var vert_2 = [mesh_ver_pos[mesh][tr[2]*3],mesh_ver_pos[mesh][tr[2]*3+1],mesh_ver_pos[mesh][tr[2]*3+2]];

		var vector_1 =[vert_0[0] - vert_1[0], vert_0[1] - vert_1[1],vert_0[2] - vert_1[2]];
		var vector_2 =[ vert_0[0] - vert_2[0], vert_0[1] - vert_2[1], vert_0[2] - vert_2[2] ];

		var vnormal = clac_vec(vector_1, vector_2);
		
		mesh_ver_normals[mesh][tr[0]*3] = vnormal[0];
		mesh_ver_normals[mesh][tr[0]*3+1] = vnormal[1];
		mesh_ver_normals[mesh][tr[0]*3+2] = vnormal[2];
		
		mesh_ver_normals[mesh][tr[1]*3] = vnormal[0];
		mesh_ver_normals[mesh][tr[1]*3+1] = vnormal[1];
		mesh_ver_normals[mesh][tr[1]*3+2] = vnormal[2];
		
		mesh_ver_normals[mesh][tr[2]*3] = vnormal[0];
		mesh_ver_normals[mesh][tr[2]*3+1] = vnormal[1];
		mesh_ver_normals[mesh][tr[2]*3+2] = vnormal[2];
	
	}
}
function wmdl_parse_mesh(gnFile,istart)
{
	var numbar =0;
	gnFile.seek(istart);
	var version = swap32(gnFile.getUint32());
    var numunk0 =  swap32(gnFile.getUint32());
	mesh_nvert[nummesh] = swap32(gnFile.getUint32());
	gnFile.seek(gnFile.tell()+4);
	var sizeofvec = swap32(gnFile.getUint32());
	gnFile.seek(gnFile.tell()+8);
	var ENDVERBUFF = swap32(gnFile.getUint32());
	var numunk_1= swap32(gnFile.getUint32());
	var START_NumIndx = swap32(gnFile.getUint32());
	mesh_nidx[nummesh] = swap32(gnFile.getUint32())*3;
	var FileSize = swap32(gnFile.getUint32());
    var numbones = swap32(gnFile.getUint32());
	gnFile.seek(gnFile.tell()+8);
	var EndMESH = swap32(gnFile.getUint32());
	gnFile.seek(gnFile.tell()+12);
	var EndFILE = swap32(gnFile.getUint32());
	gnFile.seek(gnFile.tell()+4);
	var STARTNEXTMESH = swap32(gnFile.getUint32());
	gnFile.seek(numunk0+1);
	var numunk = gnFile.getUint8();
	gnFile.seek(gnFile.tell()+numunk);
	var numvar = Math.round((sizeofvec / mesh_nvert[nummesh]) / 4) - 5;
	mesh_ver_pos[nummesh]=[];
	mesh_ver_normals[nummesh]=[];
	mesh_ver_uvs[nummesh]=[];
	mesh_tri[nummesh]=[];
	for (var i = 0; i < mesh_nvert[nummesh] ; i++)
    {
		mesh_ver_pos[nummesh][i*3] = gnFile.getFloat32(gnFile.tell(),1);
		mesh_ver_pos[nummesh][i*3+1] = gnFile.getFloat32(gnFile.tell(),1);
		mesh_ver_pos[nummesh][i*3+2] = gnFile.getFloat32(gnFile.tell(),1);
		mesh_ver_uvs[nummesh][i*2] = gnFile.getFloat32(gnFile.tell(),1);
		mesh_ver_uvs[nummesh][i*2+1]=gnFile.getFloat32(gnFile.tell(),1);
		mesh_ver_normals[nummesh][i*3] = 0.0;
		mesh_ver_normals[nummesh][i*3+1] = 0.0;
		mesh_ver_normals[nummesh][i*3+2] = 0.0;
		gnFile.seek(gnFile.tell()+numvar*4);
	}
	gnFile.seek( EndMESH - mesh_nidx[nummesh]*4);
	for (var i = 0; i <  mesh_nidx[nummesh]; i++)
	{
	   mesh_tri[nummesh][i]=gnFile.getUint32();
    }
	var numchar =  swap16(gnFile.getUint16());
	mesh_name[nummesh] =gnFile.getString(numchar)+"_"+nummesh;
	calc_normalvector(nummesh);
	nummesh+=1;
	return STARTNEXTMESH;
}
function __read_header_WMDL(data) {
	
		__reset_data();
		 var nextstart=0;
		 var gnFile = new jDataView(data);
		 nextstart=  wmdl_parse_mesh(gnFile,nextstart);
		 while( nextstart != 0)
			  nextstart=  wmdl_parse_mesh(gnFile,nextstart);

		totalmesh = nummesh;
}
function calc_databone_skl()
{
	if (version==0)
	{
		for (var i = 0; i < numbone; i++)
			{
				
				
				var quaternion = [bont_quats[i][0],bont_quats[i][1],bont_quats[i][2],bont_quats[i][3]];
				var rotation = [];
		
				rotation = quaternionToRotation(quaternion);
				//rotation = QuaternionToYawPitchRoll(quaternion);
				var position =[bone_position[i][0],bone_position[i][1],bone_position[i][2]];
				
				bone_data_out[i] = position[0].toFixed(6) + " " + position[1].toFixed(6) + " " + position[2].toFixed(6) + " " + rotation[0].toFixed(6) + " " + rotation[1].toFixed(6) + " " + rotation[2].toFixed(6);

			}
				
		
		
	}
	else  if (version==1||version==2)
	{
		for (var i = 0; i < numbone; i++)
		{
		
		calc_databone();
		}
	}
	
	
}
function GetBoneWeightD2( num,  size)
{
	var max = size[0];
	var boneWeight = num[0];

	for (var i = 1; i < 4; i++)
	{
		if (max < size[i])
		{
			max = size[i];
			boneWeight = num[i];
		}
	}
	return boneWeight;
}

function Calc_weightsets_skl()
{
	
	for (var i = 0; i < nummesh; i++)
	{
		mesh_weightsets_output[i] = [];
		
			for (var j = 0; j < mesh_weightsets[i].length; j++)
			{
				
					var WeightsetSize = [];
					var intWeightSet =[];
						WeightsetSize = mesh_weights[i][j];
						intWeightSet =mesh_weightsets[i][j];
						var outw = GetBoneWeightD2(intWeightSet, WeightsetSize);
						
						mesh_weightsets_output[i][j]=get_bone_from_id(outw);
			}

	}
	// weightsets_output
}
function get_bone_from_id(id)
{
if (version==0)
return bone_id[id];
else return id;
}
function copy_mat(inmat)
{
var matdata	=[];
if ($.isArray(inmat))
for (var x=0;x<inmat.length;x++)
{
	matdata=[];
	for (var y=0;y<inmat[x].length;y++)
		matdata[x][y]= inmat[x][y];
}
return 	matdata
}
function copy_vec(invec)
{
var vec	=[];
if ($.isArray(invec))
for (var x=0;x<invec.length;x++)
{
	vec[x]=invec[x];
}
return 	vec
}


function __bone_swap_data()
{
	for (var i=0;i<numbone;i++)
	{
		var matdata=[];
		var name="";
		var nSubbone=0;
		var par=0
		var data_out ="";
		var id=0;
		var position=[];
		var ct=[];
		var quats=[];
		var k = 0;
		k=bone_id[i];
		
			matdata= copy_mat(bone_matdata[i])
			name=bone_name[i];
			nSubbone=bone_nSubbone[i];
			par=bone_par[i];
			data_out=bone_data_out [i];
			id=bone_id[i];
			position=copy_vec(bone_position[i]);
			ct=copy_vec(bont_ct[i]);
			quats=copy_vec(bont_quats[i]) ;
			
			bone_matdata[i] = copy_mat(bone_matdata[k]);
			bone_name[i]=bone_name[k];
			bone_nSubbone[i]=bone_nSubbone[k];
			bone_par[i]=bone_nSubbone[k];
			bone_data_out [i] =bone_data_out[k];
			bone_id[i]=-1;
			bone_position[i] =copy_vec(bone_position[k]);
			bont_ct[i]=copy_vec(bont_ct[k]);
			bont_quats[i]=copy_vec(bont_quats[k]) ;
			
			bone_matdata[k] = copy_mat(matdata);
			bone_name[k]=name;
			bone_nSubbone[k]=nSubbone;
			bone_par[k]=par;
			bone_data_out [k] =data_out;
			bone_id[k]=id;
			bone_position[k] =copy_vec(position);
			bont_ct[k]=copy_vec(ct);
			bont_quats[k]=copy_vec(quats) ;
			
	
	}
	
}
function __read_header_SKL(data)
{
	version=0;
	var gnFile = new jDataView(data);
	gnFile.seek(8)
	version = swap32(gnFile.getUint32());
	var skeletonHash=0;
	var zero,numBoneIDs,offsetVertexData,unknown,offset1,offsetAnimationIndices,offset2,offset3,offsetToStringss;
	numbone=0;
	 if (version==1||version==2)
	 {
		 skeletonHash= swap32(gnFile.getUint32());
		 numbone= swap32(gnFile.getUint32());
	 }
	else if (version == 0)
	{

        zero=swap16(gnFile.getUint16());
		numbone=swap16(gnFile.getUint16());
		numBoneIDs=swap32(gnFile.getUint32());
		offsetVertexData=swap16(gnFile.getUint16());
        unknown=swap16(gnFile.getUint16());
		offset1=swap32(gnFile.getUint32());
		offsetAnimationIndices=swap32(gnFile.getUint32());
        offset2=swap32(gnFile.getUint32());
		offset3=swap32(gnFile.getUint32());
		offsetToStrings=swap32(gnFile.getUint32());
		 gnFile.seek(offsetVertexData)
	}
	 if (version==1||version==2)
	 {
        for(var k=0;k<numbone;k++)
		{
			bone_name[k]= gnFile.getString(32).replace(/\0[\s\S]*$/g,'');
			bone_par[k]=swap32(gnFile.getInt32());
			gnFile.seek(gnFile.tell()+4);
			bone_matdata[k]=[]
			for (var i = 0; i < 4; i++)
			{
				bone_matdata[k][i]=[]
				if (i<3)
				for (var j = 0; j < 4; j++)
				{
					bone_matdata[k][i][j] = gnFile.getFloat32(gnFile.tell(),1);
				}
				else
				{
					bone_matdata[k][i][0]=0.0; 
					bone_matdata[k][i][1]=0.0;
					bone_matdata[k][i][2]=0.0;
					bone_matdata[k][i][3]=1.0;
					
				}
				
			}
			 for (var n=0;n<4;n++)
                bone_matdata[k][3][n] = -bone_matdata[k][3][n];
				
		
            }
			if (version == 2)
			{
			numBoneIDs =swap32(gnFile.getUint32());
		
			for (var i=0;i<numBoneIDs;i++)
			{
				buf =swap32(gnFile.getUint32());
				bone_id[i]=buf;
			}
			
			
			
			}
		

				
	 } 
	 else if (version == 0)
	 {
	
		for(var k=0;k<numbone;k++)
		{
			 var zero2 =swap16(gnFile.getUint16());
			swap16(gnFile.getUint16());
			 
			bone_par[k]=swap16(gnFile.getInt16());
			if (bone_par[k]==65535) bone_par[k]=-1;
		    gnFile.seek(gnFile.tell()+10);
			bone_name[k]="bone_"+k ;
			bone_position[k]=[gnFile.getFloat32(gnFile.tell(),1),gnFile.getFloat32(gnFile.tell(),1),gnFile.getFloat32(gnFile.tell(),1)];
			gnFile.seek(gnFile.tell()+12);
			bont_quats[k]=[gnFile.getFloat32(gnFile.tell(),1),gnFile.getFloat32(gnFile.tell(),1),gnFile.getFloat32(gnFile.tell(),1),gnFile.getFloat32(gnFile.tell(),1)]; 
			bont_ct[k]=[gnFile.getFloat32(gnFile.tell(),1),gnFile.getFloat32(gnFile.tell(),1),gnFile.getFloat32(gnFile.tell(),1)];
			gnFile.seek(gnFile.tell()+32);
		}	


	    gnFile.seek(offsetAnimationIndices);
        for (var i=0;i<numBoneIDs;i++)
            bone_id[i] =swap16(gnFile.getUint16());
	}
//	__bone_swap_data();
	Calc_weightsets_skl();
	calc_databone_skl();
	
}
function __read_header_SKN(data) {
		__reset_data();
		
		var gnFile = new jDataView(data);
		gnFile.seek(0);
        var  magic = swap32(gnFile.getUint32());
	    var version =  swap16(gnFile.getUint16());
		var numObjects = swap16(gnFile.getUint16());
		var numMaterials = swap32(gnFile.getUint32());
		totalmesh = numMaterials;
		nummesh=numMaterials;
		console.log("SKN version:"+version);
		var startVertex=[],numVertices,startIndex=[],numIndices;
		
				for (var i = 0; i < numMaterials; i++)
				{
					  mesh_name[i]=gnFile.getString(64).replace(/\0[\s\S]*$/g,'');
					  startVertex[i]= swap32(gnFile.getUint32());
					  mesh_nvert[i] = swap32(gnFile.getUint32());
					  startIndex[i] = swap32(gnFile.getUint32());
					  mesh_nidx[i] = swap32(gnFile.getUint32());
					    mesh_ver_pos[i]=[];
						mesh_ver_normals[i]=[];
						mesh_ver_uvs[i]=[];
						mesh_tri[i]=[];
						mesh_weightsets[i]=[];
						mesh_weights[i]=[];
				}

			  if (version == 2 ||version==1||version==3)
			   {
				  numIndices=  swap32(gnFile.getUint32());
				   numVertices=  swap32(gnFile.getUint32());
			   }
			  else if (version == 4)
			  {
				   var part1 =  swap32(gnFile.getUint32());
				   numIndices=  swap32(gnFile.getUint32());
				   numVertices=  swap32(gnFile.getUint32());
				   gnFile.seek(gnFile.tell()+48);
					
			  }
			  else
			  {
				  console.log("version: Error");
				  return 0;
			  }
		
				
				var toal=0,object=0,adf =0;
			   for (var  j = 0; j < numIndices; j++) 
			   {
				    if (j- startIndex[object]- mesh_nidx[object]==0) 
					{
						adf+=mesh_nvert[object];
						object+=1;
						toal=j;
					}
				   mesh_tri[object][j-toal]= swap16(gnFile.getUint16())-adf ;
				  
			   }
			    toal=0;object=0;adf =0;
               for (var j = 0; j <  numVertices; j++)
               {
					if (j- startVertex[object]-mesh_nvert[object]==0) 
					{
						
						object+=1;
						toal=j;
					}
					mesh_ver_pos[object][(j-toal)*3]=gnFile.getFloat32(gnFile.tell(),1);
					mesh_ver_pos[object][(j-toal)*3+1]=gnFile.getFloat32(gnFile.tell(),1);
					mesh_ver_pos[object][(j-toal)*3+2]=gnFile.getFloat32(gnFile.tell(),1);
					
					
					mesh_weightsets[object][(j-toal)]=[gnFile.getUint8(),gnFile.getUint8(),gnFile.getUint8(),gnFile.getUint8()];
					
					mesh_weights[object][(j-toal)]=[gnFile.getFloat32(gnFile.tell(),1),gnFile.getFloat32(gnFile.tell(),1),gnFile.getFloat32(gnFile.tell(),1),gnFile.getFloat32(gnFile.tell(),1)];
					
					mesh_ver_normals[object][(j-toal)*3]=gnFile.getFloat32(gnFile.tell(),1);
					mesh_ver_normals[object][(j-toal)*3+1]=gnFile.getFloat32(gnFile.tell(),1);
					mesh_ver_normals[object][(j-toal)*3+2]=gnFile.getFloat32(gnFile.tell(),1);
					
					mesh_ver_uvs[object][(j-toal)*2]=gnFile.getFloat32(gnFile.tell(),1);
					mesh_ver_uvs[object][(j-toal)*2+1]=gnFile.getFloat32(gnFile.tell(),1);
					
					mesh_ver_uvs[object][(j-toal)*2+1]=1.0-mesh_ver_uvs[object][(j-toal)*2+1];
					if (mesh_ver_uvs[object][(j-toal)*2]>1.0) {mesh_ver_uvs[object][(j-toal)*2]-=1.0;}
               }
	
	
		return 1;
	}