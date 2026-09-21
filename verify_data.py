import json,pathlib,gzip,hashlib
p=pathlib.Path(__file__).parent
books=json.loads((p/'data/bible.js').read_text().removeprefix('window.BIBLE=').removesuffix(';\n'))
assert len(books)==66
assert len({b['id'] for b in books})==66
assert sum(len(b['s']) for b in books)==1189
for lang,key in [('cus','s'),('cut','t'),('kjv','en')]:
    raw=gzip.decompress((p/f'data/source-{lang}.json.gz').read_bytes())
    metadata=json.loads((p/'data/sources.json').read_text())
    assert hashlib.sha256(raw).hexdigest()==metadata[lang]['sha256']
    original=json.loads(raw)['books']
    total=0
    for b,src in zip(books,original):
        assert len(b[key])==len(src['chapters'])
        for ch,source in zip(b[key],src['chapters']):
            assert set(ch)=={str(v['verse']) for v in source['verses']}
            assert all(isinstance(t,str) and t.strip() for t in ch.values())
            total+=len(ch)
    print(lang,total,'verses; all chapter boundaries, verse keys and source hashes verified')
assert '神爱世人' in books[42]['s'][2]['16']
assert 'God so loved the world' in books[42]['en'][2]['16']
print('PASS: 66 books, 1189 chapters, John 3:16 Chinese/English reference checks')
