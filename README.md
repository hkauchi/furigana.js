# Furigana.js
Furigana.js は日本語入力でのふりがな入力や、ルビ付きHTML入力をサポートするjQueryプラグインです。

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

## ふりがなオブジェクト
ふりがなオブジェクトは以下の３つのメソッドを持ちます。

1.`html()`

rubyタグを含むHTMLを返す。

2.`kana()`

入力中のテキストの全体のふりがなを返す。

3.`parts()`

文字列を構成する要素の配列を返す。この要素は `"kanji"` と `"kana"` の属性のみを持ったオブジェクトであり、漢字とふりがなのセットの場合は両方に値がセットされているが、かなのみの場合は `"kana"` にのみ値がセットされている。
