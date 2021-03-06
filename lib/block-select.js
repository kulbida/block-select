
(function(){

  "use strict";

  jQuery.fn.extend({

    blockSelect: function() {

      jQuery(this).each(function (index, node) {

        (function () {

          var struct, selectedItems, data, autocompleteShown = false, autocompleteItemIndex = 0,
              matchItems = [],
              id = jQuery(node).data("id"),
              config = {
                width: jQuery(node).data("width") || "300px"
              },
              presentationTemplate = function (id, title) {
                return ""+
"<h2 class='block-select'>"+title+"</h2>"+
"<div class='presentation' data-object='presentation-"+id+"'>"+
"<input type='text' data-object='input' autocomplete='off' placeholder='Start typing' />"+
"<ul data-object='autocomplete-list' style='outline:none;'></ul>"+

"<div data-object='show-autocomplete' style='outline:none;'><span class='triangle'></span></div>"+
"<ul data-object='selected-tags' style='outline:none;'></ul>"+
"<select multiple='multiple' name='"+id+"' style='display:none;outline:none;' data-object='dest-select'></select>"+
"</div>";
              };

          struct = jQuery(node).find("li").map(function (_, li) {
            return {
              id: jQuery(li).data("id"),
              title: jQuery(li).html(),
              selected: jQuery(li).data("selected") || false,
              marked: false
            }
          }).toArray();

          selectedItems = struct.filter(function (item) {
            return item.selected;
          });

          data = struct.filter(function (item) {
            return !item.selected;
          });


          var tag = function (item) {
            var klass;

            if (item.marked) {
              klass = "class='selected'";
            } else {
              klass = "";
            }
            return "<li "+klass+" data-object='selected-item' data-id='"+item.id+"' data-title='"+item.title+"' style='outline:none;'>"+
item.title+
"<span data-object='delete-tag-"+id+"' class='delete-tag' href='#'>&times;</span>"+
"</li>";
          };


          jQuery(node).after(presentationTemplate(id, $(node).data("caption")));

          var $dest = jQuery(document).find("div[data-object='presentation-"+id+"']");

          $dest.find("[data-object='show-autocomplete']").on("click", function (event) {
            setTimeout(function () {
              if (autocompleteShown) {
                $dest.trigger("hide-autocomplete-"+id);
              } else {
                $dest.trigger("show-autocomplete-"+id, {event: event, value: ''});
              }
              autocompleteShown = !autocompleteShown;
            }, 0);
          });


          $dest.find("[data-object='input']").on("keyup", function (event) {
            // if not escape
            if (event.keyCode !== 27) {
              var value = jQuery(event.target).val();
              $dest.trigger("show-autocomplete-"+id, {event: event, value: value});
            }
          });


          jQuery(document).on("click", function (event) {
            if (!jQuery(event.target).is("[data-object='show-autocomplete'], span.triangle")) {
              $dest.trigger("hide-autocomplete-"+id);
              autocompleteShown = false;
            };
          });


          $dest.find("[data-object='input']").on("focus, click", function (event) {
            setTimeout(function () {
              $dest.trigger("show-autocomplete-"+id, {event: event, value: ''});
              $dest.find("input[type='text']").focus();
              autocompleteShown = true;
            }, 0);
          });


          $dest.find("[data-object='input']").on("keydown", function (event) {

            var value = jQuery(event.target).val();

            if (value.length === 0) {
              // backspace
              if (event.which === 8) {

                var lastTag = selectedItems.slice(-1)[0];

                if (lastTag.marked) {
                  lastTag = Object.assign({}, lastTag);
                  lastTag.marked = false
                  data.push(lastTag);
                  selectedItems = selectedItems.filter(function (item) {
                    return item.id !== lastTag.id;
                  });
                } else {
                  lastTag.marked = true;
                }
                $dest.trigger("display-selected-"+id);
              }
            }

            switch (parseInt(event.keyCode)) {
            // up arrow
            case 38:
              $dest.trigger("go-up.autocomplete");
              return false;

            // down arrow
            case 40:
              if (autocompleteShown) {
                $dest.trigger("go-down.autocomplete");
              } else {
                setTimeout(function () {
                  $dest.trigger("show-autocomplete-"+id, {event: event, value: value});
                  autocompleteShown = true;
                }, 0);
              }
              return false;

            // enter
            case 13:
              if (autocompleteShown && autocompleteItemIndex > 0) {
                var autocompleteItem = $dest.find("[data-object='autocomplete-list'] > li:nth-child("+autocompleteItemIndex+")").selector;
                if (typeof autocompleteItem !== "undefined") {
                  $dest.trigger("select-autocomplete-item-"+id, autocompleteItem);
                }
              }
              autocompleteItemIndex = 0;
              return false;

            // escape
            case 27:
              selectedItems = selectedItems.map(function (item) {
                item.marked = false;
                return item;
              });
              $dest.trigger("display-selected-"+id);
              $dest.trigger("hide-autocomplete-"+id);
              break;

            // tab
            case 9:
              $dest.trigger("hide-autocomplete-"+id);
              jQuery(document).trigger("click");
              break;
            }

          });

          $dest.on("highlight-item.autocomplete", function (_, itemIndex) {
            $dest.find("[data-object='autocomplete-list'] > li").removeClass("hovered");
            $dest.find("[data-object='autocomplete-list'] > li:nth-child("+itemIndex+")").addClass("hovered");
          });
                   
          
          $dest.on("go-up.autocomplete", function () {
            if (matchItems.length) {
              autocompleteItemIndex--;
              if (autocompleteItemIndex <= 0) {
                autocompleteItemIndex = matchItems.length;
              }
              $dest.trigger("highlight-item.autocomplete", autocompleteItemIndex);
            }
          });


          $dest.on("go-down.autocomplete", function () {
            if (matchItems.length) {
              autocompleteItemIndex++;
              if (autocompleteItemIndex > matchItems.length) {
                autocompleteItemIndex = 1;
              }
              $dest.trigger("highlight-item.autocomplete", autocompleteItemIndex);
            }
          });

          
          $dest.on("show-autocomplete-"+id, function (_, props) {

            var autocompleteTrigger = $dest.find("[data-object='show-autocomplete']");
            autocompleteTrigger.css("border-bottom", "none");

            var autocomplete = $dest.find("[data-object='autocomplete-list']"),
                re = RegExp(props.value, "i"), found;
            
            matchItems = data.filter(function (item) {
              if (props.value.length === 0) {
                return true;
              }
              found = item.title.match(re) || undefined;
              return (found && found.length && !selectedItems.includes(props.value));
            }).slice(0, 20);

            if (matchItems.length) {
              autocomplete.html(matchItems.map(function (item) {
                return "<li data-object='autocomplete-item-"+id+"' data-id='"+item.id+"' data-title='"+item.title+"'>"+item.title+"</li>";
              }).join("")).show();
            } else {
              autocomplete.html("<li class='nop'>No matches.</li>").show();
            }
            $dest.trigger("highlight-item.autocomplete", autocompleteItemIndex);
          });


          $dest.on("hide-autocomplete-"+id, function () {
            autocompleteItemIndex = 0;
            $dest.find("[data-object='autocomplete-list']").hide();

            var autocompleteTrigger = $dest.find("[data-object='show-autocomplete']");
            autocompleteTrigger.css("border-bottom", "1px solid #ccc");
          });


          $dest.on("select-autocomplete-item-"+id, function (event, item) {
            var $item = jQuery(item);

            selectedItems = selectedItems.map(function (item) {
              item.marked = false;
              return item;
            });

            selectedItems.push(data.filter(function (item) {
              return item.id === $item.data("id");
            })[0]);

            data = data.filter(function (item) {
              return item.id !== $item.data("id");
            });

            $dest.trigger("render-tags-"+id);
            $dest.trigger("render-selected-"+id);
            $dest.find("input[type='text']").val("").focus();
            $dest.trigger("show-autocomplete-"+id, {event: event, value: ""});
          });


          $dest.on("render-tags-"+id, function () {
            var tags = $dest.find("[data-object='selected-tags']");
            var tag = function (item) {
              return ""+
"<li data-object='selected-item' style='outline:none;' data-id='"+item.id+"' data-title='"+item.title+"'>"+
item.title+
"<span data-object='delete-tag-"+id+"' class='delete-tag' href='#'>&times;</span>"+
"</li>";
            };
            tags.html(selectedItems.map(function (item) { return tag(item); }).join(""));
          });

          $dest.on("render-selected-"+id, function () {
            $dest.find("[data-object='dest-select']").html(selectedItems.map(function (item) {
              return "<option selected='selected' value='"+item.id+"'>"+item.title+"</option>";
            }).join("")+data.filter(function (item) {
              var selectedItemIds = selectedItems.map(function (item) {
                return item.id;
              });
              return !selectedItemIds.includes(item.id);
            }).map(function (item) {
              return "<option value='"+item.id+"'>"+item.title+"</option>";
            }).join(""));
            $dest.trigger("adjust-input-paddings-"+id);
          });


          $dest.on("delete-autocomplete-item-"+id, function (_, item) {
            var $item = jQuery(item);

            // delete item from selected items
            selectedItems = selectedItems.filter(function (item) {
              return item.id !== $item.data("id");
            });

            // add item back to data store
            data.push({
              id: $item.data("id"),
              title: $item.data("title")
            });

            $dest.trigger("display-selected-"+id);
            $dest.trigger("show-autocomplete-"+id, {value: ''});
          });


          $dest.on("adjust-input-paddings-"+id, function () {
            var $autocompleteList = $dest.find("[data-object='autocomplete-list']");
            var $input = $dest.find("[data-object='input']");
            var $selectedTags = $dest.find("[data-object='selected-tags']");
            var top, leftDelta = 3, topDelta = 3;

            top = parseInt($selectedTags.height());

            $input.css("padding-top", top+topDelta+"px");
            $input.css("padding-left", leftDelta+"px");
            $input.css("border", "1px solid #ccc");

            $input.css("width", config.width);
            $selectedTags.css("max-width", $input.width());
            $input.css("padding-bottom", "8px");
            $input.css("margin", "0");

            $autocompleteList.css("position", "absolute");
            $autocompleteList.css("padding", "10px 0");
            $autocompleteList.css("margin", "0");
            $autocompleteList.css("left", "0");
            $autocompleteList.css("margin-top", "-5px");
            $autocompleteList.css("width", parseInt($input.outerWidth(true)+18)+"px");
            $autocompleteList.css("display", "block");
            $autocompleteList.css("cursor", "pointer");
            $autocompleteList.css("max-height", "180px");
            $autocompleteList.css("overflow-y", "auto");
            $autocompleteList.css("overflow-x", "hidden");

            var width = config.width.replace("px", "");
            $dest.css("width", width+"px");

            var autocompleteTrigger = $dest.find("[data-object='show-autocomplete']");
            autocompleteTrigger.css("height", parseInt($input.outerHeight(true))-2+"px");
            autocompleteTrigger.css("width", "20px");
            autocompleteTrigger.css("margin-right", "-20px");
            autocompleteTrigger.css("right", "0");
            autocompleteTrigger.css("top", "0");
            autocompleteTrigger.css("position", "absolute");
            $autocompleteList.css("z-index", 9999+index);
            $autocompleteList.css("outline", "none");

            var triangle = autocompleteTrigger.find("span.triangle");
            triangle.css("top", "44%");
            triangle.css("left", "25%");
            triangle.css("position", "absolute");

          });

          
          $dest.on("display-selected-"+id, function () {
            var tags = $dest.find("[data-object='selected-tags']");
            tags.html(selectedItems.map(function (item) {
              return tag(item);
            }).join(""));
            $dest.find("input[type='text']").val("").focus();
            $dest.trigger("render-selected-"+id);
          });
          

          var observe = function () {

            jQuery(document).on("click", "[data-object='autocomplete-item-"+id+"']", function (event) {
              $dest.trigger("select-autocomplete-item-"+id, event.target);
              return false;
            });

            jQuery(document).on("click", "span[data-object='delete-tag-"+id+"']", function (event) {
              $dest.trigger("delete-autocomplete-item-"+id, jQuery(event.target).parent("[data-object='selected-item']"));
              return false;
            });

            $dest.trigger("display-selected-"+id);
            $dest.trigger("render-selected-"+id);

            $(node).remove();

            $dest.trigger("hide-autocomplete-"+id);
          };

          observe();

        })();

      });
    }
  });

  $(document).ready(function () {
    $("[data-object='block-select']").blockSelect();
  });

})();
