
(function(){

  "use strict";

  jQuery.fn.extend({

    blockSelect: function() {

      
      var destSelect = function (struct) {

        var options = jQuery.map(struct, function (item) {
          return `<option ${item.selected ? 'selected="selected"' : ''} value="${item.value}">${item.title}</option>`;
        }).join("");

        return `<select multiple="multiple" data-object="dest-select">${options}</select>`;
      };

      var autocomplete = function () {
        return `
<ul class="block-select autocomplete">
<li></li>
</ul>
`;
      };

      var textAreaItem = function (item) {
        var $node = $(`<div class="item" data-object="selected-item" data-value="${item.id}">${item.title}</div>`);
        $node.on("click", function (event) {
          console.log(event.target);
        });
        return $node;
      };

      var textAreaItems = function (struct) {
        return jQuery.map(struct, function (item) {
          if (item.selected) {
            return textAreaItem(item);
          }
        });
      };


      $(this).each(function (_, node) {

        (function () {

          var data = $(node).find("li").map(function (index, li) {

            return {
              id: $(li).data("id"),
              title: $(li).html(),
              selected: $(li).data("selected") || false
            }

          }).toArray();

          var presentationId = jQuery(node).data("id");
          $(node).after(`<div data-object="presentation-${presentationId}"></div>`);
          var $dest = $(document).find(`div[data-object="presentation-${presentationId}"]`);

          $dest.on("input-changed", function (event, value) {
            console.log(value);
          });

          $dest.on("draw", function (event, selectedStruct) {
            // $dest.html(`<textarea data-object="area-input"></textarea>${autocomplete()}${destSelect(selectedStruct.data)}`);
            
            console.log(textAreaItems(selectedStruct.data));

            $(textAreaItems(selectedStruct.data)).map(function (item) {
              console.log(item);
              return $(itme).html();
            }).join("");

            $dest.append();
          });

          var observe = function () {
            $(document).on("keyup", "[data-object='area-input']", function () {
              $dest.trigger("input-changed", $(this).val());
            });
          };

          $dest.trigger("draw", {data: data});

          observe();

        })();

      });

    }

  });


})();
