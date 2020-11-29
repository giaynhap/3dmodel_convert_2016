function __dislay(ctrlList)
{
	
	ctrlList.removeChild(document.getElementById("anim_list_2"));
	ctrlList2 = document.createElement('div');
	ctrlList2.setAttribute('id', "anim_list_2");
	for (var i=0;i<numAnim;i++)
	{
	var element = document.createElement('BUTTON');

	
	var t = document.createTextNode(anim_name[i]);       // Create a text node
    element.appendChild(t);  
	element.setAttribute('class', "button1");
	element.style.width=200;
	element.style.height=25;
	element.style.background= ":#30588e"; 
	//element.onclick="show_anim(i)";
	element.setAttribute('onclick', "show_anim("+i+")");
	ctrlList2.appendChild(element);
	
	}
	ctrlList.appendChild(ctrlList2)
	return ctrlList
}