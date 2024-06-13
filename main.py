from fastapi import FastAPI,UploadFile,Form,Response,Depends
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from fastapi.staticfiles import StaticFiles
from fastapi_login import LoginManager
from fastapi_login.exceptions import InvalidCredentialsException
from typing import Annotated
import sqlite3

con = sqlite3.connect('market.db', check_same_thread=False)
cur = con.cursor()
    # 테이블이 없을때만 
cur.execute(f"""
            CREATE TABLE IF NOT EXISTS items (
                id INTEGER PRIMARY KEY,
                title TEXT NOT NULL,
                image BLOB,
                price INTEGER NOT NULL,
                description TEXT,
                place TEXT NOT NULL,
                insertAt INTEGER NOT NULL
            );
            """)

app = FastAPI()
# 3) 토근발급@@@@@
secret = "super-coding"   # secret : 어떻게 인코딩 할지 정하는것
manager = LoginManager(secret,'/login')  # login에서만 발금

@manager.user_loader()
def query_user(data):
    WHERE_STATEMENTS = f'id="{data}"'
    if type(data) == dict:
        WHERE_STATEMENTS = f'''id="{data['id']}"'''
    con.row_factory = sqlite3.Row
    cur = con.cursor()
    user = cur.execute(f"""
                       SELECT * FROM users WHERE {WHERE_STATEMENTS}
                       """).fetchone()
    return user
# 3) 로그인
@app.post('/login')
def login(id:Annotated[str,Form()], 
           password:Annotated[str,Form()]):
    user = query_user(id)
    #print(user)         # 로그인시 유저정보 print(SELECT)
    if not user:
        raise InvalidCredentialsException
    elif password != user['password']:
        raise InvalidCredentialsException
    
    # 4) 토큰생성후 js에 리턴 / 토근을 디코딩하면 값이 드러남
    access_token = manager.create_access_token(data={
        'sub':  {
            'id':user['id'],
            'name':user['name'],
            'email':user['email']
        }
    })
    
    return {'access_token':access_token}

# 2) 서버 -> DB : 사용자 확인(값 저장?)
@app.post('/signup')
def signup(id:Annotated[str,Form()], 
           password:Annotated[str,Form()],
           name:Annotated[str,Form()],
           email:Annotated[str,Form()]):
    cur.execute(f"""
                INSERT INTO users(id,name,email,password)
                VALUES ('{id}', '{name}', '{email}', '{password}')
                """) 
    con.commit()
    return '200'


    # write.html로 부터 받을값
@app.post('/items')
async def create_item(image:UploadFile, 
                title:Annotated[str,Form()], 
                price:Annotated[int,Form()], 
                description:Annotated[str,Form()], 
                place:Annotated[str,Form()],
                insertAt:Annotated[int,Form()],
                ):

    image_bytes = await image.read()
    cur.execute(f"""
                INSERT INTO 
                items(title,image,price,description,place,insertAt)
                VALUES ('{title}','{image_bytes.hex()}', {price}, '{description}', '{place}',{insertAt})
                """)
    con.commit()
    return '200'
    
@app.get('/items')
async def get_items(user=Depends(manager)): # manager: login Manager / 인증된 상태에서만 보내주겠다.
    con.row_factory = sqlite3.Row   # 컬럼명도 같이 가져옴 ['id': 1]...
    cur = con.cursor()
    rows = cur.execute(f"""
                       SELECT * from items;
                       """).fetchall()
    return JSONResponse(jsonable_encoder(dict(row) for row in rows))

@app.get('/images/{item_id}')
async def get_image(item_id):
    cur = con.cursor()
    image_bytes = cur.execute(f"""
                              SELECT image FROM items WHERE id={item_id}
                              """).fetchone()[0]
    return Response(content=bytes.fromhex(image_bytes), media_type='image/*')   # 16진법 hex로 받아온것을 image로 Response돌려주겠다.


app.mount("/", StaticFiles(directory="frontend", html=True), name="static")