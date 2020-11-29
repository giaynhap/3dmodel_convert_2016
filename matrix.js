
function GetPosition(matrix)
{
	var returnvec=[];
	returnvec[0]=matrix[0][3];
	returnvec[1]= matrix[1][3];
	returnvec[2]=matrix[2][3];
	return returnvec;
}
function quaternionToRotation(quaternion)
{
	var testw = quaternion[3] * quaternion[1] - quaternion[2] * quaternion[0];
	var rotation =[];
	rotation[0] = Math.atan2(2 * (quaternion[3] * quaternion[0] + quaternion[1] * quaternion[2]), 1 - 2 * (quaternion[0] * quaternion[0] + quaternion[1] * quaternion[1]));
	rotation[1] = Math.asin(2 * (testw));
	rotation[2] = Math.atan2(2 * (quaternion[3] * quaternion[2] + quaternion[0] * quaternion[1]), 1 - 2 * (quaternion[1] * quaternion[1] + quaternion[2] * quaternion[2]));
	if (isNaN(rotation[1]) == true)
	{
		rotation[1] = (Math.PI / 2.0) * (testw / Math.abs(testw));
	}
	return rotation;

}
function GetRotation(m)
{
	var tr = m[0][0] + m[1][1] + m[2][2];
	var x, y, z, w;
	if (tr > 0.0)
	{
		var s = Math.sqrt(1.0 + tr) * 2.0;
		w = 0.25 * s;
		x = (m[2][1] - m[1][2]) / s;
		y = (m[0][2] - m[2][0]) / s;
		z = (m[1][0] - m[0][1]) / s;
	}
	else if ((m[0][0] > m[1][1]) && (m[0][0] > m[2][2]))
	{
		var s = Math.sqrt(1.0 + m[0][0] - m[1][1] - m[2][2]) * 2.0;
		w = (m[2][1] - m[1][2]) / s;
		x = 0.25 * s;
		y = (m[0][1] + m[1][0]) / s;
		z = (m[0][2] + m[2][0]) / s;
	}
	else if (m[1][1] > m[2][2])
	{
		var s = Math.sqrt(1.0 + m[1][1] - m[0][0] - m[2][2]) * 2.0;
		w = (m[0][2] - m[2][0]) / s;
		x = (m[0][1] + m[1][0]) / s;
		y = 0.25* s;
		z = (m[1][2] + m[2][1]) / s;
	}
	else
	{
		var s = Math.sqrt(1.0 + m[2][2] - m[0][0] - m[1][1]) * 2.0;
		w = (m[1][0] - m[0][1]) / s;
		x = (m[0][2] + m[2][0]) / s;
		y = (m[1][2] + m[2][1]) / s;
		z = 0.25 * s;
	}
	var quat = [ x, y, z, w ];
	return quat;
}
function worldToLocalMatrix( Matrix4x4,  parentIndex, hMas)
{
	var localMatrix =[];
	var UnitMatrix = [];
	var inverseMatrix = [];
	if (parentIndex < 0) return Matrix4x4;
	for (var i=0;i<4;i++) 
		
		UnitMatrix[i]=[0,0,0,0];
	for (var i = 0; i < 4; i++)
	{
		UnitMatrix[i][i] = 1;
	}
	
	var index = parentIndex;
	for (var i = 0; i < 4; i++)
	{
		inverseMatrix[i]=[];
		var matrix_1 =[];
		for (var k=0;k<4;k++)
		{
			matrix_1[k]=[];
			matrix_1[k][0]=hMas[index][0][k];
			matrix_1[k][1]= hMas[index][1][ k];
			matrix_1[k][2]=hMas[index][2][ k];
			matrix_1[k][3]=hMas[index][3][ k];
			matrix_1[k][4]= UnitMatrix[i][k];	
		}
	
		var roots = solveEquations(matrix_1);
		
		for (var j = 0; j < 4; j++)
		{
			inverseMatrix[i][j] = roots[j];
			
		}
	}
	
	for (var i = 0; i < 4; i++)
	{
		localMatrix[i]=[];
		for (var j = 0; j < 4; j++)
		{
			localMatrix[i][j] = inverseMatrix[i][0] * Matrix4x4[0][j] + inverseMatrix[i][1] * Matrix4x4[1][j] + inverseMatrix[i][2] * Matrix4x4[2][j] + inverseMatrix[i][3] * Matrix4x4[3][j];
		}
	}
	return localMatrix;
}

var savequot=[];
var constquot=[];
var saveResult=[];
function solveEquations( quot)
{
	var count = quot.length;
	savequot = [];
	
	constquot = [];
	saveResult = [];
	for (var i = 0; i < count; i++)
	{
		savequot[i]=[];
		for (var j = 0; j < count; j++)
		{
			savequot[i][j] = quot[i][j];
		}
		
		constquot[i] = quot[i][count];
		saveResult[i] = 0;
	}
	var basic = 0;
	basic = getMatrixResult(savequot);
	if (Math.abs(basic) < 0.00001)
	{
		return saveResult;
	}
	temp =[];

	for (var i = 0; i < saveResult.length; i++)
	{
		
		temp = getReplaceMatrix(i);
		
		saveResult[i] = getMatrixResult(temp) / basic;
		 
	
	}
	return saveResult;
}
function getMatrixResult( input)
{
		
	if (input.length == 2)
	{
		return input[0][0] * input[1][1] - input[0][1] * input[1][ 0];
	}
	else
	{
		var temp = [];
		var tempinput = [];
		var result = 0;
		for (var i = 0; i < input.length; i++)
		{
			temp[i] = input[i][0];
			var m = 0, n = 0;
			for (var k = 0; k < input.length; k++)
			{
				if (k != i)
				{
					
					if ($.isArray(tempinput[n]) == false ) tempinput[n]=[];
					for (m = 0; m < input.length - 1; m++)
					{
						tempinput[n][m] = input[k][m + 1];
						
					}
					n++;
				}
			}
			if (i % 2 == 0)
			{
				result = result + temp[i] * getMatrixResult(tempinput);
			}
			else
			{
				result = result - temp[i] * getMatrixResult(tempinput);
			}
		}
		
		return result;
	}
}
function getReplaceMatrix( i)
{
	var tempresult = [];
	for (var m = 0; m < savequot.length; m++)
	{
		for (var n = 0; n < savequot.length; n++)
		{
			 if ($.isArray(tempresult[n]) == false ) tempresult[n]=[];
			if (i != m)
			{
				tempresult[n][m] = savequot[n][m];
			}
			else
			{
				tempresult[n][i] = constquot[n];
			}
			
		}
	}
	return tempresult;
}