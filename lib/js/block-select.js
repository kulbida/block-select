
(function(){

  "use strict";

  jQuery.fn.extend({

    blockSelect: function() {

      $(this).each(function (_, node) {

        (function () {

          var struct, selectedItems, data,
              id = jQuery(node).data("id"),
              config = {
                width: jQuery(node).data("width") || "300px"
              },
              presentationTemplate = function (id) {
                return `
<div class="presentation" data-object="presentation-${id}">
<textarea data-object="input" wrap="off" autocomplete="off" placeholder="Start typing a pharse"></textarea>
<div data-object="show-autocomplete">show</div>
<ul data-object="selected-tags"></ul>
<ul data-object="autocomplete-list" class="hidden"></ul>
<select multiple="multiple" name="${id}" class="hidden" data-object="dest-select"></select>
</div>`;
              };

          struct = $(node).find("li").map(function (index, li) {
            return {
              id: $(li).data("id"),
              title: $(li).html(),
              selected: $(li).data("selected") || false,
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
              klass = `class="selected"`;
            } else {
              klass = ``;
            }
            return `<li ${klass} data-object="selected-item" data-id="${item.id}" data-title="${item.title}">
${item.title}
<a data-object="delete-tag-${id}" class="delete-tag" href="#">&times;</a>
</li>`;
          };


          $(node).after(`${presentationTemplate(id)}`);

          var $dest = $(document).find(`div[data-object="presentation-${id}"]`);

          $dest.find("[data-object='show-autocomplete']").on("click", function (event) {
            $dest.trigger(`show-autocomplete-${id}`, {event: event, value: ''});
          });


          $dest.find("[data-object='input']").on("keypress", function (event) {

            var value = $(event.target).val();

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

                $dest.trigger(`display-selected-${id}`);
              }
            }
          });


          $dest.find("[data-object='input']").on("keyup", function (event) {
            var value = $(event.target).val();
            if (event.which !== 27) {
              $dest.trigger(`show-autocomplete-${id}`, {event: event, value: value});
            }
          });

          
          $dest.find("[data-object='input']").on("keydown", function (event) {
            // escape
            if (event.which === 27) {
              selectedItems = selectedItems.map(function (item) {
                item.marked = false;
                return item;
              });
              $dest.trigger(`display-selected-${id}`);
              $dest.trigger(`hide-autocomplete-${id}`);
            }

          });


          $dest.on(`show-autocomplete-${id}`, function (event, props) {

            var autocomplete = $dest.find("[data-object='autocomplete-list']"),
                re = RegExp(props.value, "i"), found,
                matchItems = data.filter(function (item) {
                  found = item.title.match(re);
                  return (found && found.length && !selectedItems.includes(props.value));
                });

            autocomplete.html(matchItems.map(function (item) {
              return `<li data-object="autocomplete-item-${id}" data-id="${item.id}" data-title="${item.title}">${item.title}</li>`;
            }).join("")).removeClass("hidden");
          });


          $dest.on(`hide-autocomplete-${id}`, function (event, props) {
            $dest.find("[data-object='autocomplete-list']").addClass("hidden");
          });


          $dest.on(`select-autocomplete-item-${id}`, function (event, item) {
            var $item = $(item);

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

            $dest.trigger(`render-tags-${id}`);
            $dest.trigger(`render-selected-${id}`);
            $dest.find("textarea").val("").focus();
            $dest.trigger(`show-autocomplete-${id}`, {event: event, value: ""});
          });


          $dest.on(`render-tags-${id}`, function (event) {
            var tags = $dest.find("[data-object='selected-tags']");
            var tag = function (item) {
              return `
<li data-object="selected-item" data-id="${item.id}" data-title="${item.title}">
${item.title}
<a data-object="delete-tag-${id}" class="delete-tag" href="#">&times;</a>
</li>
`;
            };
            tags.html(selectedItems.map(function (item) { return tag(item); }).join(""));
          });

          $dest.on(`render-selected-${id}`, function (event) {
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
            $dest.trigger(`adjust-input-paddings-${id}`);
          });


          $dest.on(`delete-autocomplete-item-${id}`, function (event, item) {
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

            $dest.trigger(`display-selected-${id}`);
          });


          $dest.on(`adjust-input-paddings-${id}`, function () {
            var $input = $dest.find("[data-object='input']");
            var $selectedTags = $dest.find("[data-object='selected-tags']");
            var top, left, leftDelta = 3, topDelta = 3;

            top = parseInt($selectedTags.height());

            var lisWidths = $selectedTags.find("li").toArray().map(function (li) { return $(li).outerWidth(); } );
            var realTagsWidth = (lisWidths.reduce(function (a, b) {
              return a + b + 6;
            }, 0));

            $input.css("padding-top", `${top+topDelta}px`);
            // removed left var
            $input.css("padding-left", `${leftDelta}px`);

            $input.css("width", `${config.width}`);
            $selectedTags.css("max-width", $input.width());
            $input.css("height", `${top+23}px`);
          });

          
          $dest.on(`display-selected-${id}`, function () {
            var tags = $dest.find("[data-object='selected-tags']");
            tags.html(selectedItems.map(function (item) {
              return tag(item);
            }).join(""));
            $dest.find("textarea").val("").focus();
            $dest.trigger(`render-selected-${id}`);
          });
          

          var observe = function () {

            $(document).on("click", `[data-object='autocomplete-item-${id}']`, function (event) {
              $dest.trigger(`select-autocomplete-item-${id}`, event.target);
            });

            $(document).on("click", `a[data-object='delete-tag-${id}']`, function (event) {
              $dest.trigger(`delete-autocomplete-item-${id}`, $(event.target).parent("[data-object='selected-item']"));
              return false;
            });

            $dest.trigger(`display-selected-${id}`);
            $dest.trigger(`render-selected-${id}`);
          };

          observe();

        })();

      });

    }
  });

})();
