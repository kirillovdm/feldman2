(function ($, undefined) {

    "use strict"; // jshint ;_;

    var ColumnCatalog = function (element, options) {
        this.$element = $(element);
        this.options  = $.extend({}, $.fn.columnCatalog.defaults, options);

        // Remove text nodes from element
        this.$element.contents().filter(function() {
            return this.nodeType == 3;
        }).remove();

        // Remove text nodes from columns
        this.$element.find('.' + this.options.columnClass).contents().filter(function () {
            return this.nodeType == 3;
        }).remove();

        // Initialize paginator values
        this._page  = this.options.page;
        this._pages = this.options.pages;

        // Initialize filter settings
        this.filter(this.options.filter || {});

        delete this.options.filter;

        this.attach();
    };

    var template_to_string = function (template) {
        if (typeof template == 'string') return template;
        if (template === undefined || template === null) return '';
        if (typeof template == 'function') template = template();
        if (template && template.toString) template = template.toString();
        if (typeof template != 'string') return '';
        return template;
    };

    var get_min_col_index = function (columns) {
        var index, min;
        for (var i = 0, l = columns.length; i < l; i++) {
            var height = columns.eq(i).height();
            if (min === undefined) {
                index = 0;
                min   = height;
            } else {
                if (height < min) {
                    index = i;
                    min = height;
                }
            }
        }
        return index;
    };

    var resize_and_append = function (records) {
        var $records     = $(records),
            columnNumber = this.columnNumber(),
            $columns     = this.$element.find('.' + this.options.columnClass),
            $columnsLen  = $columns.length,
            $window      = $(window),
            scrollTop;
        if ($columnsLen != columnNumber) {
            // Save scroll position
            scrollTop = $window.scrollTop();
            // Remove existing records
            var _records = $columns.find('> *').detach();
            // Adjust columns
            var fragment  = [];
            if (columnNumber > $columnsLen) {
                var columnTemplate = template_to_string(this.options.columnTemplate), i;
                for (i = $columnsLen; i < columnNumber; i++) {
                    fragment.push($(columnTemplate)[0]);
                }
                this.$element.append(fragment);
                $columns = $columns.add(fragment);
            } else {
                fragment = $columns.slice(columnNumber);
                $columns = $columns.not(fragment);
                fragment.remove();
            }
            // Sort existing records
            if (_records.length > 0) {
                if (_records.sort) _records.sort(function (a, b) {
                    var orderA = $(a).data('ccat-order'),
                        orderB = $(b).data('ccat-order');
                    if (!orderA || !orderB) return 0;
                    if (orderA < orderB) return -1;
                    if (orderA > orderB) return 1;
                    return 0;
                });
                // Append new records to existing records
                $records = _records.add($records);
            }
        }
        // Distribute records among columns
        if ($records) $records.each(function (index, string) {
            $columns.eq(get_min_col_index($columns)).append(string);
        });
        // Remove empty columns
        $columns.filter(':empty').remove();
        // Load scroll position if saved
        if (scrollTop) $window.scrollTop(scrollTop);
        // Load next page if required
        if ($window.outerHeight() >= $(document).outerHeight()) this.loadNext();
    };

    var _hold_off_filterchange = 0;

    ColumnCatalog.prototype = {

        constructor: ColumnCatalog,

        attach: function () {
            var self = this, $win = $(window);
            $win.resize(function () {
                self.resize();
            });
            $win.scroll(function () {
                var winHeight = $win.height(),
                    topPos    = $win.scrollTop(),
                    bottomPos = topPos + winHeight;
                if (bottomPos >= $(document).height() - winHeight) self.loadNext();
            });
            this.resize();
        },

        filter: function (key, value) {
            this._filterData = this._filterData || {};
            if (key && typeof key == 'object') {
                _hold_off_filterchange++;
                for (var p in key) this.filter(p, key[p]);
                _hold_off_filterchange--;
                if (_hold_off_filterchange === 0) this.$element.trigger('filterchange');
                return this;
            }
            if (value === undefined) {
                if (key === undefined) return $.extend({}, this._filterData || {});
                return this._filterData[key];
            }
            this._filterData[key] = value;
            if (_hold_off_filterchange === 0) this.$element.trigger('filterchange');
            return this;
        },

        addFilter: function (key, value) {
            this._filterData = this._filterData || {};
            if (key && typeof key == 'object') {
                _hold_off_filterchange++;
                for (var p in key) this.addFilter(p, key[p]);
                _hold_off_filterchange--;
                if (_hold_off_filterchange === 0) this.$element.trigger('filterchange');
                return this;
            }
            if (value === undefined || value === null) return this;
            if (!$.isArray(value)) value = [value];
            if (this._filterData[key]) {
                var fval = this._filterData[key] || [];
                if (!$.isArray(fval)) fval = [fval];
                $.each(value, function () {
                    if ($.inArray(this, fval) < 0) fval.push(this);
                });
                value = fval;
            }
            if (value.length == 1) value = value[0];
            this._filterData[key] = value;
            if (_hold_off_filterchange === 0) this.$element.trigger('filterchange');
            return this;
        },

        removeFilter: function (key, value) {
            this._filterData = this._filterData || {};
            if (key && typeof key == 'object') {
                _hold_off_filterchange++;
                for (var p in key) this.removeFilter(p, key[p]);
                _hold_off_filterchange--;
                if (_hold_off_filterchange === 0) this.$element.trigger('filterchange');
                return this;
            }
            if (!this._filterData[key]) return this;
            if (!value) {
                delete this._filterData[key];
                if (_hold_off_filterchange === 0) this.$element.trigger('filterchange');
                return this;
            }
            var fval = this._filterData[key],
                ret  = [];
            if (!$.isArray(fval)) fval = [fval];
            if (!$.isArray(value)) value = [value];
            $.each(fval, function () {
                if ($.inArray(this, value) < 0) ret.push(this);
            });
            if (ret.length > 0) {
                if (ret.length == 1) ret = ret[0];
                this._filterData[key] = ret;
            } else delete this._filterData[key];
            if (_hold_off_filterchange === 0) this.$element.trigger('filterchange');
            return this;
        },

        hasFilter: function (key, value) {
            this._filterData = this._filterData || {};
            if (!this._filterData[key]) return false;
            if (!value) return true;
            var fval = this._filterData[key];
            if ($.isArray(fval)) return $.inArray(value, fval) >= 0;
            return fval == value;
        },

        toggleFilter: function (key, value) {
            this._filterData = this._filterData || {};
            if (key && typeof key == 'object') {
                _hold_off_filterchange++;
                for (var p in key) this.toggleFilter(p, key[p]);
                _hold_off_filterchange--;
                if (_hold_off_filterchange === 0) this.$element.trigger('filterchange');
                return this;
            }
            return this[(this.hasFilter(key, value) ? 'remove' : 'add') + 'Filter'](key, value);
        },

        resize: function () {
            resize_and_append.call(this);
            // Trigger resize event
            this.$element.trigger('resized');
            return this;
        },

        reload: function () {
            // Reset paginator values
            this._pages = 1;
            this._page  = 0;
            // Cancel any pending loadings
            this.abortLoad();
            // Load first page again
            return this.load(1, true);
        },

        loadNext: function () {
            if (!this._pages) return this;
            if (this._pages <= this._page) return this;
            if (this._loading) return this;
            // Load next page based on current paginator values
            return this.load(this._page ? this._page + 1 : 1);
        },

        renderRecords: function (records, replace) {
            var recordTpl = this.options.recordTemplate,
                items = [];
            $.each(records, function () {
                var item;
                if (recordTpl && recordTpl.render) item = recordTpl.render(this);
                else item = template_to_string(recordTpl);
                items.push(item);
            });
            this[(replace ? 'replace' : 'append') + 'Records']($(items));
            // Trigger render event
            this.$element.trigger('rendered');
            return this;
        },

        appendRecords: function (records) {
            resize_and_append.call(this, records);
            return this;
        },

        replaceRecords: function (records) {
            // Purge existing items
            this.$element.find('.' + this.options.columnClass + '> *').remove();
            resize_and_append.call(this, records);
            return this;
        },

        load: function (page, replace) {
            if (!this._pages) return this;
            if (page < 1 || page > this._pages) return this;
            if (this._loading) return this;
            this._loading = true;
            this.$element.addClass(this.options.loadingClass);
            // Prepare request settings
            var reqOpts = {
                url: this.options.pageUrl,
                dataType: 'json',
                data: this.filter(),
                context: this
            };
            // Add request page
            if ($.isFunction(this.options.pageUrl)) reqOpts.url = this.options.pageUrl(page);
            else reqOpts.data = $.extend({}, reqOpts.data, {
                page: page
            });
            // Send request
            this._request = $.ajax(reqOpts).done(function (response) {
                if (response.pager) {
                    this._page  = response.pager.page;
                    this._pages = response.pager.pages;
                } else this._pages = false;
                // Reset request state
                this.$element.removeClass(this.options.loadingClass);
                this._loading = false;
                delete this._request;
                // Render received records
                this.renderRecords(response.records, replace);
            }).fail(function (xhr, text, error) {
                // Reset request state
                this.$element.removeClass(this.options.loadingClass);
                this._loading = false;
                delete this._request;
            });
            return this;
        },

        abortLoad: function () {
            if (!this._loading) return this;
            this._request.abort();
            this.$element.removeClass(this.options.loadingClass);
            this._loading = false;
            delete this._request;
            return this;
        },

        columnNumber: function () {
            var columnWidth  = this.columnWidth(),
                windowWidth  = $(window).width(),
                columnNumber = 3;
            return columnNumber < this.options.minColumns ? this.options.minColumns : columnNumber;
        },

        columnWidth: function () {
            var $columns = this.$element.find('.' + this.options.columnClass);
            if ($columns.length > 0) return $columns.eq(0).outerWidth();
            var columnTpl = template_to_string(this.options.columnTemplate),
                tempCol = $(columnTpl).prependTo(this.$element),
                width = tempCol.outerWidth();
            tempCol.remove();
            return width;
        }

    };

    $.fn.columnCatalog = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('columnCatalog'),
                options = typeof option == 'object' && option;
            if (!data) $this.data('columnCatalog', (data = new ColumnCatalog(this, options)));
            if (typeof option == 'string') data[option]();
        });
    };

    $.fn.columnCatalog.defaults = {
        columnTemplate: '<div class="ccat-column"></div>',
        columnClass: 'ccat-column',
        loadingClass: 'loading',
        dataTemplate: '',
        minColumns: 1,
        pages: 1,
        page: 1
    };

    $.fn.columnCatalog.Constructor = ColumnCatalog;

})(window.jQuery);