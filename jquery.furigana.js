/*!
 * Furigana.js is a jQuery plugin that supports the text input of
 * Japanese with furigana.
 * 
 * Furigana.js is released under the MIT License.
 * (c) 2012 Hisahiro Kauchi.
 */
(function ($) {
	function isKanji(c) { return ("\u4E00" <= c && c <= "\u9FBF") || c == "\u30F5" || c == "\u30F6" || c == "\u3005"; }
	function isKatakana(c) { return "\u30A1" <= c && c <= "\u30F4"; }
	function isHiragana(c) { return "\u3041" <= c && c <= "\u3094"; }
	function isKana(c) { return isKatakana(c) || isHiragana(c); }
	function isZAlpha(c) { return ("\uFF21" <= c && c <= "\uFF3A") || ("\uFF41" <= c && c <= "\uFF5A"); }
	function toHiragana(s) {
		var h = "", c, i, j;
		for (i = 0; i < s.length; i++) {
			if (isKatakana(s.charAt(i))) {
				for (j = i; j < s.length; j++) {
					c = s.charAt(j);
					if (isKatakana(c)) h += String.fromCharCode(c.charCodeAt(0) - 0x60);
					else h += c;
				}
				return h;
			}
		}
		return s;
	}

	var Part = function (kana, kanji) {
		this.kana = kana;
		this.kanji = kanji || null;
		this.length = (kanji ? kanji : kana).length;
	};
	Part.prototype = {
		html: function () {
			return this.kanji
				? "<ruby>" + this.kanji + "<rp>[</rp><rt>" + this.kana + "</rt><rp>]</rp></ruby>"
				: this.kana;
		}
	};

	var Sentence = function () {
		this.parts = [];
		this.fixedParts = 0;
	};
	Sentence.prototype = {
		length: 0,
		add: function (kana, kanji, temp) {
			var kjParts = [], knParts, i, c, n = 0;
			var inkanji = false, kjStart = false, kjMode = false, reg, kj, kn;
			this.parts.length = this.fixedParts;
			if (!kanji) {
				this.parts.push(new Part(kana));
				if (!temp) {
					this.fixedParts++;
					this.length += kana.length;
				}
				return this;
			}
			// corrects last letter of kana
			kn = kana.charAt(kana.length - 1);
			kj = kanji.charAt(kanji.length - 1);
			if (isZAlpha(kn)) {
				if (kn != kj && isKana(kj)) {
					n = 1;
					if (isZAlpha(kana.charAt(kana.length - 2))) n++;
					kana = kana.substring(0, kana.length - n) + kj;
				} else {
					if (kn == "\uFF2E" || kn == "\uFF4E") {
						kana = kana.substring(0, kana.length - 1) + "\u3093";
					}
				}
			} else if (isKana(kn) && !isKanji(kj) && !isKana(kj)) {
				kana += kj;
			}
			//
			n = 0;
			for (i = 0; i < kanji.length; i++) {
				c = kanji.charAt(i);
				if (i == 0) {
					kjMode = kjStart = inkanji = isKanji(c.charAt(0));
					kjParts[n] = c;
				} else {
					if (inkanji == isKanji(c.charAt(0))) {
						kjParts[n] += c;
					} else {
						kjParts[++n] = c;
						inkanji = !inkanji;
					}
				}
			}
			reg = "";
			for (i = 0; i < kjParts.length; i++) {
				if (kjParts[i] == "\u30B1" && i > 0 && i < kjParts.length - 1) {
					kjParts[i - 1] += kjParts[i] + kjParts[i + 1];
					kjParts.splice(i, 2);
					i--;
					continue;
				}
				reg += kjMode ? "(.+)" : "(" + toHiragana(kjParts[i]) + ")";
				kjMode = !kjMode;
			}
			kjMode = kjStart;
			knParts = kana.match(new RegExp("^" + reg + "$"));
			if (!knParts) {
				this.parts.push(new Part(kana, kanji));
				if (!temp) {
					this.fixedParts++;
					this.length += kanji.length;
				}
				return this;
			}
			knParts.shift();
			for (i = 0; i < kjParts.length; i++) {
				this.parts.push(
					kjMode ? new Part(knParts[i], kjParts[i]) : new Part(kjParts[i]));
				if (!temp) this.fixedParts++;
				kjMode = !kjMode;
			}
			if (!temp) {
				this.length += kanji.length;
			}
			return this;
		},
		removeLast: function () {
			var last = this.parts[this.fixedParts - 1];
			this.length -= last.length;
			this.parts.length = --this.fixedParts;
		},
		clear: function () {
			this.parts = [];
			this.length = 0;
			this.fixedParts = 0;
		},
		kanji: function () {
			var s = [];
			for (var i = 0; i < this.parts.length; i++)
				s[i] = this.parts[i].kanji || this.parts[i].kana;
			return s.join("");
		}
	};

	var FuriganaObject = function (f) {
		this.kana = function () {
			var i, s = [], parts = f.sentence.parts;
			for (i = 0; i < parts.length; i++)
				s[i] = parts[i].kana;
			return s.join("");
		};
		this.html = function () {
			var i, s = [], parts = f.sentence.parts;
			for (i = 0; i < parts.length; i++)
				s[i] = parts[i].html();
			return s.join("");
		},
		this.parts = function () {
			var i, p = [], parts = f.sentence.parts;
			for (i = 0; i < parts.length; i++)
				p.push({ kana:parts[i].kana, kanji:parts[i].kanji });
			return p;
		};
	};

	var Furigana = function (textfield) {
		this.textfield = textfield;
		this.fo = new FuriganaObject(this);
		this.callback = function () {};
		this.init();
	};
	Furigana.prototype = {
		init: function () {
			if (this.sentence) {
				this.sentence.clear();
			} else {
				this.sentence = new Sentence();
			}
			this.prev = "";
			this.pending = "";
			this.kana = "";
			this.kanji = "";
			this.kanjiFound = false;
			this.callback();
		},
		setCallback: function (callback) {
			var _this = this;
			this.callback = function () {
				callback.call(_this.textfield, _this.fo);
			};
			this.callback();
		},
		watch: function () {
			var text = this.textfield.value;
			if (text.length == 0) {
				this.init();
				return;
			}
			if (text.length < this.sentence.length) {
				this.sentence.removeLast();
				this.textfield.value = this.sentence.kanji();
				this.callback();
				this.prev = "";
				this.pending = "";
				return;
			}
			this.pending = text.substring(this.sentence.length);
			if (this.pending != this.prev) {
				this.check();
				this.callback();
				this.prev = this.pending;
			}
		},
		check: function () {
			if (this.kanjiFound) {
				if (this.pending.indexOf(this.kanji) == 0) {
					this.sentence.add(this.kana, this.kanji);
					this.pending = this.pending.substring(this.kanji.length);
					if (this.pending) this.sentence.add(this.pending, null, true);
					this.kana = "";
					this.kanji = "";
					this.prev = "";
					this.kanjiFound = false;
				} else {
					this.kanjiFound = this.hasKanji();
					this.kanji = this.pending;
					this.sentence.add(this.kana, this.kanji, true);
				}
			} else {
				this.kanjiFound = this.hasKanji();
				if (this.kanjiFound) {
					this.kanji = this.pending;
					this.kana = toHiragana(this.prev);
					this.sentence.add(this.kana, this.kanji, true);
				} else {
					if (this.prev == this.pending) {
						this.sentence.add(this.pending);
						this.kana = "";
						this.kanji = "";
						this.pending = "";
						this.prev = "";
					} else {
						this.sentence.add(this.pending, null, true);
					}
				}
			}
		},
		hasKanji: function () {
			for (var i = 0; i < this.pending.length; i++) {
				if (isKanji(this.pending.charAt(i))) return true;
			}
			return false;
		},
		fix: function () {
			this.pending = this.textfield.value.substring(this.sentence.length);
			this.check();
			this.callback();
		}
	};

	$.fn.furigana = function () {
		var callback = null;
		var a = arguments;
		if (a.length == 1) {
			if ($.isFunction(a[0])) {
				callback = a[0];
			}
		} else if (a.length == 2) {
			var type = a[0];
			var obj = a[1];
			callback = function (fo) {
				var text = fo[type]();
				$(obj).each(function () {
					if (this.tagName == "INPUT" || this.tagName == "TEXTAREA") {
						this.value = text;
					} else {
						this.innerHTML = text;
					}
				});
			};
		}
		this.each(function () {
			var f = new Furigana(this);
			f.setCallback(callback);
			//$.data(this, "furigana", furigana);
			if ($.browser.webkit || $.browser.msie) {
				var watch = function () {
					setTimeout(function () { f.watch(); }, 0);
				};
				$(this).keydown(function (e) {
						if (e.which == 13) f.fix();
						else watch();
					})
					.keyup(watch)
					.keypress(watch)
					.blur(function () {
						f.fix();
						watch();
					});
			} else {
				var watching = false, watch = null;
				watch = function () {
					f.watch();
					if (watching) {
						setTimeout(watch, 10);
					}
				};
				$(this).keydown(function (e) {
						if (e.which == 13) f.fix();
					}).focus(function (e) {
						watching = true;
						setTimeout(watch, 0);
					}).blur(function (e) {
						watching = false;
					});
			}
		});
		return this;
	};
})(jQuery);
