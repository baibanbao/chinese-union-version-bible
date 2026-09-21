"""从已下载的 GetBible v2 文件构建静态数据；原文按明确节号保存。"""
import json, re, pathlib, hashlib, gzip
root = pathlib.Path(__file__).parent
books = json.loads((root/'data/books.json').read_text())
assert len(books)==66
metadata = {}
for lang, key in [('cus','s'),('cut','t'),('kjv','en')]:
    source=gzip.decompress((root/f'data/source-{lang}.json.gz').read_bytes())
    data=json.loads(source)
    assert len(data['books'])==66
    metadata[lang]={'url':f'https://api.getbible.net/v2/{lang}.json','sha256':hashlib.sha256(source).hexdigest(),'translation':data['translation']}
    for i,book in enumerate(data['books']):
        assert book['nr']==i+1
        chapters=[]
        for n,ch in enumerate(book['chapters'],1):
            assert ch['chapter']==n
            verses={}
            for v in ch['verses']:
                text=v['text'].strip()
                if key in ('s','t'):text=re.sub(r'[ \t]+','',text)
                assert str(v['verse']) not in verses
                verses[str(v['verse'])]=text
            chapters.append(verses)
        books[i][key]=chapters
        if key=='t':books[i]['traditional']=book['name'].lstrip('\ufeff')
(root/'data/bible.js').write_text('window.BIBLE='+json.dumps(books,ensure_ascii=False,separators=(',',':'))+';\n')
(root/'data/sources.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2))
print('Built',len(books),'books;',sum(len(b['s']) for b in books),'chapters')
