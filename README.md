# Furigana.js
Furigana.js は日本語入力でのふりがな入力や、ルビ付きHTML入力をサポートするjQueryプラグインです。
（現時点で jQuery1.10 には未対応です）

## 使い方
使い方は二通りあります。

1.入力中のテキストに対応するふりがなやHTMLを直接エレメントにセットする。

    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>
    <script src="jquery.furigana.js"></script>
    <script>
      $("#text1").furigana("kana", $("#kana"));
      $("#text2").furigana("html", $("#htmlWithRubyTag"));
    </script>

2.入力中のテキストの状態を保持するふりがなオブジェクトをコールバック関数で受け取る。

    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>
    <script src="jquery.furigana.js"></script>
    <script>
      $("#text").furigana(function (fo) {
        $("#content").html(fo.html());
      });
    </script>

### ふりがなオブジェクト
ふりがなオブジェクトは以下の３つのメソッドを持ちます。

1.`html()`

rubyタグを含むHTMLを返します。

2.`kana()`

入力中のテキストの全体のふりがなを返します。

3.`parts()`

文字列を構成するオブジェクトの配列を返します。
このオブジェクトは「かなのみの部分」「漢字とふりがなのセット」のどちらかです。
かなのみの部分の場合は `{ "kana":"こんちには", "kanji":null }` 、
漢字とふりがなのセットの場合は `{ "kana":"かんじ", "kanji":"漢字" }` のようなオブジェクトになります。
これを利用して独自のHTML等を生成することが可能です。

## サンプル

[example](http://hkauchi.github.com/furigana.js/)

## 更新履歴

1.0.1

* ふりがなオブジェクトの parts() が機能しなかったのを修正

1.0.0

* 初期リリース
