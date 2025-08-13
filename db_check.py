import sqlite3
conn = sqlite3.connect('ai_class.db')
cursor = conn.cursor()
cursor.execute("SELECT * FROM papers")
print(cursor.fetchall())  # 打印数据
conn.close()