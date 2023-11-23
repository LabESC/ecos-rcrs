# Comparar issues de cada topico entre elas e rankear as que possuem mais issues em comum
# com o topico de interesse

def gera_ranking_issues_topico(topics):
    # Gera ranking de issues para cada topico
    for topic in topics:
        topic['ranking_issues'] = []
        for issue in topic['issues']:
            issue['ranking'] = 0
            for issue2 in topic['issues']:
                if issue['id'] != issue2['id']:
                    issue['ranking'] += len(set(issue['labels']) & set(issue2['labels']))
            topic['ranking_issues'].append(issue)
        topic['ranking_issues'] = sorted(topic['ranking_issues'], key=lambda k: k['ranking'], reverse=True)
    return topics
