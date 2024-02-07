let data = '';
const errMsg = `Something Went Wrong :(`;

function updateData(data)
{
	fs.writeFile('data.json', JSON.stringify(data), function (err) {
		if (err) throw err;
	});
	return true
}

function populateCDTable(cdData)
{
	if(data.Credentials == null)
		return;

	let i = 0;

	$("#cdm-c-table-body").html("");
	Object.keys(cdData.Credentials).forEach(function (e)
	{
		i++;
		$("#cdm-c-table-body").append(`<tr><td>${i}</td><td class="uk-table-link uk-text-truncate" uk-tooltip="Click To Open in Browser!"><a class="uk-link-reset" onclick="require('electron').shell.openExternal(this.innerHTML)">${cdData.Credentials[e].website}</a></td><td><button class="uk-button uk-button-default uk-button-main view-btn" style="margin-right: 20px;" data-cid="${e}">VIEW</button><button class="uk-button uk-button-default uk-button-main tb-delete-btn" data-cid="${e}">DELETE</button></td></tr>`);
	});

	if(i > 1)
		$("#cdm-total-cds").html(`${i} TOTAL CREDENTIALS!`);
	else
		$("#cdm-total-cds").html(`${i} TOTAL CREDENTIAL!`);

	$("#cdm-c-table-body .view-btn").click(function ()
	{
		let btn = $(this);
		let id = btn.attr("data-cid");

		$("#cdm-view-cd-modal .uk-modal-body").html(`<p class="esp-view-cd-modal-site">WEBSITE: ${cdData.Credentials[id].website}</p><p class="esp-view-cd-modal-email">EMAIL: ${cdData.Credentials[id].email}</p><p class="esp-view-cd-modal-pass">PASSWORD: ${cdData.Credentials[id].pass}</p>`);

		$("#cdm-search-page").css({filter: "blur(2px)"});
		UIkit.modal($("#cdm-view-cd-modal")).show();
		$("#cdm-view-cd-modal").on("hidden", function ()
		{
			$("#cdm-search-page").css({filter: "blur(0px)"});
		})
	});


	$("#cdm-c-table-body .tb-delete-btn").click(function ()
	{
		let btn = $(this);
		let id = btn.attr("data-cid");

		$("#cdm-search-page").css({filter: "blur(2px)"});
		UIkit.modal.confirm('This Credential Will be Deleted!!').then(function ()
		{
			$("#cdm-search-page").css({filter: "blur(0px)"});
			delete data.Credentials[id];
			if (updateData(data))
			{
				btn.parent().parent().remove();

				if ($("#cdm-c-table-body").html() === "")
				{
					$("#cdm-cd-search-input").val("");
				}

				if($("#cdm-cd-search-input").val() === "")
					searchTable("");

				if ($("#cdm-c-table-body").html() !== "" && $("#cdm-cd-search-input").val() !== "")
					searchTable($("#cdm-cd-search-input").val());

				showAlert("Credential Deleted.", "#cdm-search-page");
			}
			else
				showAlert(errMsg, "#cdm-search-page");
		},() => {$("#cdm-search-page").css({filter: "blur(0px)"});});

	});
}

function updateEspDropdown(data)
{
	$("#email-select ul").html("<li class='uk-active'><a href='#'>Custom</a></li>");

	if(data.ESP != null)
	{
		Object.keys(data.ESP).forEach(function (e)
		{
			$("#email-select ul").append(`<li><a href="#">${e}</a><i class="fas fa-times" onclick="deleteESP(this)" style="color:#E74C3C"></i></li>`);
		});
	}

	$("#email-select ul").append("<li class='uk-nav-divider'></li><li><a  href='#cdm-add-esp-modal'>ADD NEW</a></li>");

	$("#email-select a").click(function ()
	{
		$("#email-select li").removeClass("uk-active");
		$(this).parent().addClass("uk-active");

		let esp = $(this).html();

		if (esp !== "ADD NEW")
			$("#email-select-btn").html(esp);

		if (esp !== "Custom" && esp !== "ADD NEW")
		{
			$("#cdm-add-email").val(data.ESP[esp]).addClass("uk-disabled input-disabled").parent().attr("uk-tooltip", "Select CUSTOM From the Dropdown to Add Custom ESP");
			$("#cdm-add-email").parent().children("i").addClass("input-disabled");

			return;
		}
		else if(esp === "ADD NEW")
		{
			$("#cdm-add-page").css({filter: "blur(2px)"});
			UIkit.modal($("#cdm-add-esp-modal")).show();
			$("#cdm-add-esp-modal").on("hidden",(function ()
			{
				$("#cdm-add-page").css({filter: "blur(0)"});
			}))
		}

		$("#email-select-btn").html("CUSTOM");
		$("#cdm-add-email").val("").removeClass("uk-disabled input-disabled").parent().removeAttr("uk-tooltip");
		$("#cdm-add-email").parent().children("i").removeClass("input-disabled")
	});
}

function getData()
{
	fs.readFile("data.json", function(err, d) {

		if(err)
		{
			if (err.code = "ENOENT")
			{
				fs.writeFile('data.json', "{}", function (err)
				{
					if (err) throw err;
					console.log('Saved!');
				});

				getData();
				return;
			}
			else
			{
				console.log(err.code);
				return;
			}
		}


		if (d == "" || d == "undefined")
		{
			d = "{}"
		}

		data = JSON.parse(d);
		updateEspDropdown(data);

		$("#cdm-add-btn").click(function ()
		{
			let email = $("#cdm-add-email").val();
			let pass = $("#cdm-add-pass").val();
			let website = $("#cdm-add-website").val();

			if (email === "" || pass === "" || website === "")
			{
				$("#cdm-add-btn").addClass("uk-animation-shake uk-button-danger");
				setTimeout(function ()
				{
					$("#cdm-add-btn").removeClass("uk-animation-shake uk-button-danger");
				}, 1000);
				// $("#cdm-add-page .error").addClass("uk-animation-fade").removeClass("uk-hidden");
				$("#cdm-add-page .error").animate({
					opacity: 1
				},600,null);
				return;
			}

			if (data.Credentials == null)
			{
				data.Credentials = {};
			}

			if (!website.includes("www.") || !website.includes("http://") || !website.includes("https://"))
			{
				website = "www." + website;
			}

			let i = 0;

			Object.keys(data.Credentials).forEach(function (e)
			{
				if(i < parseInt(e))
				{
					i = parseInt(e)
				}
			});

			let newId = i + 1;

			data.Credentials[newId] = {"email" : email, "pass" : pass, "website" : website};

			if(updateData(data))
			{
				$("#cdm-add-pass").val("");
				$("#cdm-add-website").val("");
				$("#email-select-btn").html("CUSTOM");
				$("#cdm-add-email").val("").removeClass("uk-disabled input-disabled").parent().removeAttr("uk-tooltip");
				$("#cdm-add-email").parent().children("i").removeClass("input-disabled");

				$("#cdm-add-page .error").animate({
					opacity: 0
				},600,null);

				showAlert(`Credentials Added Successfully!`, "#cdm-add-page")
				populateCDTable(data);
			}
			else
			{
				showAlert(errMsg, "#cdm-add-page")
			}

		});

		$("#cdm-esp-add-btn").click(function ()
		{
			let name = $("#cdm-esp-name").val();
			let email = $("#cdm-esp-email").val();

			if (email === "" || name === "")
			{
				$("#cdm-add-esp-modal .error").animate({opacity:1},100);
				return;
			}

			if (data.ESP == null)
			{
				data.ESP = {};
			}

			data.ESP[name] = email;

			if(updateData(data))
			{
				updateEspDropdown(data);
				UIkit.modal($("#cdm-add-esp-modal")).hide()
				$("#cdm-add-esp-modal").on("hidden", function ()
				{
					showAlert(`ESP "${name}" Added Successfully!`, "#cdm-add-page")
				})
			}
			else
			{
				showAlert(errMsg, "#cdm-add-page")
			}

		});

		populateCDTable(data);

		$("#cdm-cd-search-input").on("input", function ()
		{
			let keyword = $("#cdm-cd-search-input").val();
			searchTable(keyword);
		});
	});
}


function searchTable(keyword)
{
	if (keyword === "")
	{
		populateCDTable(data);
		return;
	}

	let s = JSON.stringify(data);
	let newData = JSON.parse(s);

	Object.keys(newData.Credentials).forEach(function (k)
	{
		if(!newData.Credentials[k].website.includes(keyword))
		{
			delete newData.Credentials[k];
		}
	});
	populateCDTable(newData);
}
function deleteESP(e)
{
	let esp = $(e).parent().find("a").html();

	delete data.ESP[esp];

	let status = updateData(data);

	if (status)
	{
		updateEspDropdown(data);
		showAlert(`ESP "${esp}" Deleted Successfully!`, "#cdm-add-page")
	}
	else
	{
		showAlert(errMsg, "#cdm-add-page")
	}
}

function changePage(currentPageId, newPageId)
{
	$(currentPageId).addClass("uk-hidden");
	let name = $(currentPageId).attr("data-name");
	if (name != "GOPHER")
		$(`#nav`).find(`li[data-name="${name}"]`).remove();

	$(`#nav`).append(`<li><a href="#" data-to-page-id="`+newPageId+`" onclick="navChangePage(this.getAttribute('data-to-page-id'), this)">${$(newPageId).attr("data-name")}</a></li>`)
	$(newPageId).removeClass("uk-hidden");
}

function navChangePage(toPageId, e)
{
	$(".page").addClass("uk-hidden");

	let shouldDelete = false;

	$("#nav li").each(function ()
	{
		if (shouldDelete) $(this).remove();

		if ($(this).find("a").attr("data-to-page-id") === toPageId)
			shouldDelete = true;
	});

	$(toPageId).removeClass("uk-hidden");
}

function showAlert(msg, bgElemIdClass)
{
	$(bgElemIdClass).css({filter: "blur(2px)"});
	UIkit.modal.alert(msg).then(function ()
	{
		$(bgElemIdClass).css({filter: "blur(0)"});
	});
}

$(function ()
{
	getData();

	setTimeout(function ()
	{
		$("#loading-screen").animate({
			opacity: 0
		},600, function ()
		{
			$("#loading-screen").remove();
			$("#title-bar").animate({
				height:"25px"
			}, 1000, "swing")
			$("#bar").animate({
				opacity:1
			}, 1000)
		});

	}, 3000);
});
