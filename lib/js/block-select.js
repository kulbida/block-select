
(function(){

  "use strict";

  jQuery.fn.extend({

    blockSelect: function() {

      var presentationTemplate = function (id) {
        return `<div class="presentation" data-object="presentation-${id}">

<textarea data-object="input"></textarea>

<div data-object="show-autocomplete">show</div>

<ul data-object="selected-tags"></ul>
<ul data-object="autocomplete-list" class="hidden"></ul>
<select multiple="multiple" class="hidden" data-object="dest-select"></select>
</div>`;
      };


      $(this).each(function (_, node) {

        (function () {

          var struct = $(node).find("li").map(function (index, li) {

            return {
              id: $(li).data("id"),
              title: $(li).html(),
              selected: $(li).data("selected") || false
            }

          }).toArray();
          var selectedItems = struct.filter(function (item) {
            return item.selected;
          });

          var data = struct.filter(function (item) {
            return !item.selected;
          });


          var tag = function (item) {
            return `<li data-object="selected-item" data-id="${item.id}" data-title="${item.title}">
${item.title}
<a data-object="delete-tag" href="#">&times;</a>
</li>`;
          };


          var presentationId = jQuery(node).data("id");
          $(node).after(`${presentationTemplate(presentationId)}`);

          var $dest = $(document).find(`div[data-object="presentation-${presentationId}"]`);

          $dest.find("[data-object='show-autocomplete']").on("click", function (event) {
            $dest.trigger("show-autocomplete", {event: event, value: ''});
          });

          $dest.find("[data-object='input']").on("keyup", function (event) {
            
            $dest.trigger("show-autocomplete", {event: event, value: $(event.target).val()});

            // if (event.which === 13) {
            //   console.log("enter pressed");
            // }

          });


          $dest.on("show-autocomplete", function (event, props) {
            var autocomplete = $dest.find("[data-object='autocomplete-list']");
            var matchItems = data.filter(function (item) {
              return (item.title.toLowerCase().startsWith(props.value.toLowerCase()) && !selectedItems.includes(props.value));
            });
            autocomplete.html(matchItems.map(function (item) {
              return `<li data-object="autocomplete-item" data-id="${item.id}" data-title="${item.title}">${item.title}</li>`;
            }).join("")).removeClass("hidden");
          });


          $dest.on("hide-autocomplete", function (event, props) {
            $dest.find("[data-object='autocomplete-list']").addClass("hidden");
          });


          $dest.on("select-autocomplete-item", function (event, item) {
            var $item = $(item);
            var tags = $dest.find("[data-object='selected-tags']");
            tags.html(`${tags.html()}
<li data-object="selected-item" data-id="${$item.data("id")}" data-title="${$item.data("title")}">
${$item.data("title")}
<a data-object="delete-tag" href="#">&times;</a>
</li>
`);

            selectedItems.push(data.filter(function (item) {
              return item.id === $item.data("id");
            })[0]);

            data = data.filter(function (item) {
              return item.id !== $item.data("id");
            });

            $dest.trigger("render-selected");
            $dest.find("textarea").val("").focus();
            $dest.trigger("hide-autocomplete");
          });


          $dest.on("render-selected", function (event) {
            $dest.find("[data-object='dest-select']").html(selectedItems.map(function (item) {
              return `<option selected="selected" value="${item.id}">${item.title}</option>`;
            }).join("")+data.filter(function (item) {
              var selectedItemIds = selectedItems.map(function (item) {
                return item.id;
              });
              return !selectedItemIds.includes(item.id);
            }).map(function (item) {
              return `<option value="${item.id}">${item.title}</option>`;
            }).join(""));
            $dest.trigger("adjust-input-paddings");
          });


          $dest.on("delete-autocomplete-item", function (event, item) {
            var $item = $(item);

            // delete item from selected items
            selectedItems = selectedItems.filter(function (item) {
              return item.id !== $item.data("id");
            });

            // add item back to data store
            data.push({
              id: $item.data("id"),
              title: $item.data("title")
            });

            $dest.trigger("display-selected");
          });


          $dest.on("adjust-input-paddings", function () {
            var $input = $dest.find("[data-object='input']");
            var $selectedTags = $dest.find("[data-object='selected-tags']");
            var top, left, leftDelta = 0, topDelta = 0;

            console.log("===============================");
            console.log("input width:", $input.width());
            console.log("input height:", $input.height());
            console.log("-------------------------------");
            console.log("tags width:", $selectedTags.outerWidth());
            console.log("tags height:", $selectedTags.outerHeight(true));
            console.log("===============================");

            top = parseInt($selectedTags.height())-20;

            var lisWidths = $selectedTags.find("li").toArray().map(function (li) { return $(li).outerWidth(); } );
            var realTagsWidth = (lisWidths.reduce(function (a, b) {
              return a + b + 6;
            }, 0));

            console.log("real li width:", realTagsWidth);

            if (realTagsWidth > 300) {
              left = realTagsWidth % 300;
            } else {
              left = realTagsWidth;
            }

            console.log("left:", left);
            console.log("top:", top);

            // var leftDelta = parseInt(realTagsWidth / 300) * 10;

            if ($input.width() <= 90) {
              topDelta += 30;
            }


            $input.css("padding-top", `${top+topDelta}px`);
            $input.css("padding-left", `${left+leftDelta}px`);

            $input.css("height", `${top+23}px`);
          });

          
          $dest.on("display-selected", function () {
            var tags = $dest.find("[data-object='selected-tags']");
            tags.html(selectedItems.map(function (item) {
              return tag(item);
            }).join(""));
            $dest.find("textarea").val("").focus();
            $dest.trigger("render-selected");
          });
          

          var observe = function () {

            $(document).on("keyup", "[data-object='area-input']", function () {
              $dest.trigger("input-changed", $(this).val());
            });

            $(document).on("click", "[data-object='autocomplete-item']", function (event) {
              $dest.trigger("select-autocomplete-item", event.target);
            });

            $(document).on("click", "a[data-object='delete-tag']", function (event) {
              $dest.trigger("delete-autocomplete-item", $(event.target).parent("[data-object='selected-item']"));
              return false;
            });

            $dest.trigger("display-selected");
            $dest.trigger("render-selected");
          };

          observe();

        })();

      });

    }

  });


})();
