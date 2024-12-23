To keep your bot updated with changes from the template, you can add the template repository as a remote and merge changes:

0. Add the template repository as a remote:
```
git remote add template https://github.com/hyper-tech-ch-Bots/template.git
```

1. Fetch changes from the template:
```
git fetch template
```

2. Merge the changes into your main branch:
```
git merge template/main
```

3. Resolve any conflicts if they occur
Up to you! :p

4. Commit the merged changes:
```
git commit -m "Merge updates from template"
```

5. Push the changes to your repository:
```
git push origin main
```
